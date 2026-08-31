"""
Game Session Management and Gameplay Engine Service.
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict
import uuid
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.game import GameSession, GuessMove
from app.models.user import User
from app.engine.solver import evaluate_guess, FeedbackType
from app.engine.scoring import calculate_score
from app.engine.dictionary import get_dictionary
from app.schemas.game import GameSessionOut, GuessMoveOut, LetterFeedbackOut
from app.services.achievement_service import AchievementService


def build_keyboard_status(moves: List[GuessMove]) -> Dict[str, str]:
    """
    Computes best status for each letter on virtual keyboard.
    Precedence: BULL > BEAR > MISS
    """
    status_priority = {"BULL": 3, "BEAR": 2, "MISS": 1}
    kb_map: Dict[str, str] = {}

    for move in moves:
        for fb in move.feedback:
            letter = fb["letter"].upper()
            st = fb["status"]
            curr = kb_map.get(letter)
            if not curr or status_priority[st] > status_priority.get(curr, 0):
                kb_map[letter] = st

    return kb_map


def sanitize_session_out(session: GameSession) -> GameSessionOut:
    """
    Anti-Cheat Sanitizer:
    Ensures target_word is NEVER revealed to the client while game is in_progress.
    """
    moves_out: List[GuessMoveOut] = []
    for m in session.moves:
        fb_list = [LetterFeedbackOut(index=fb["index"], letter=fb["letter"], status=fb["status"]) for fb in m.feedback]
        moves_out.append(
            GuessMoveOut(
                id=m.id,
                move_number=m.move_number,
                guess_word=m.guess_word,
                feedback=fb_list,
                bulls_count=m.bulls_count,
                bears_count=m.bears_count,
                seconds_taken=m.seconds_taken,
                created_at=m.created_at
            )
        )

    # Calculate keyboard status
    kb_status = build_keyboard_status(session.moves)

    # Reveal target word ONLY when game is concluded
    revealed_target = session.target_word if session.status in ("won", "lost", "abandoned") else None

    return GameSessionOut(
        id=session.id,
        user_id=session.user_id,
        mode=session.mode,
        daily_date=session.daily_date,
        status=session.status,
        attempts_used=session.attempts_used,
        max_attempts=session.max_attempts,
        time_limit_seconds=session.time_limit_seconds,
        time_elapsed_seconds=session.time_elapsed_seconds,
        final_score=session.final_score,
        score_breakdown=session.score_breakdown,
        target_word=revealed_target,
        moves=moves_out,
        keyboard_status=kb_status,
        started_at=session.started_at,
        completed_at=session.completed_at
    )


class GameService:
    @staticmethod
    async def create_game(
        db: AsyncSession,
        mode: str = "classic",
        user_id: Optional[str] = None
    ) -> GameSession:
        dictionary = get_dictionary()
        daily_date = None
        max_attempts = 6
        time_limit = 120

        if mode == "daily":
            # UTC Date string
            daily_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            # If logged in user already started or played today's game, return it
            if user_id:
                stmt = select(GameSession).options(selectinload(GameSession.moves)).where(
                    and_(
                        GameSession.user_id == user_id,
                        GameSession.mode == "daily",
                        GameSession.daily_date == daily_date
                    )
                )
                res = await db.execute(stmt)
                existing = res.scalar_one_or_none()
                if existing:
                    return existing

            target_word = dictionary.get_daily_target_word(daily_date)
            max_attempts = 6
            time_limit = 180  # 3 minutes for daily

        elif mode == "blitz":
            target_word = dictionary.get_random_target_word()
            max_attempts = 5
            time_limit = 90  # 90 seconds speed mode

        elif mode == "zen":
            target_word = dictionary.get_random_target_word()
            max_attempts = 8
            time_limit = 9999  # Unlimited

        else:  # classic
            mode = "classic"
            target_word = dictionary.get_random_target_word()
            max_attempts = 6
            time_limit = 120

        session = GameSession(
            user_id=user_id,
            target_word=target_word,
            mode=mode,
            daily_date=daily_date,
            status="in_progress",
            attempts_used=0,
            max_attempts=max_attempts,
            time_limit_seconds=time_limit,
            time_elapsed_seconds=0,
            final_score=0
        )
        db.add(session)
        await db.commit()
        
        # Reload with moves relationship
        stmt = select(GameSession).options(selectinload(GameSession.moves)).where(GameSession.id == session.id)
        res = await db.execute(stmt)
        return res.scalar_one()

    @staticmethod
    async def get_session_by_id(db: AsyncSession, session_id: str) -> Optional[GameSession]:
        stmt = select(GameSession).options(selectinload(GameSession.moves)).where(GameSession.id == session_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def submit_guess(
        db: AsyncSession,
        session_id: str,
        guess_word: str,
        seconds_taken: int = 0,
        user_id: Optional[str] = None
    ) -> GameSession:
        session = await GameService.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game session not found.")

        if session.status != "in_progress":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot submit guess. Game session is already {session.status}."
            )

        guess_clean = guess_word.strip().upper()
        if len(guess_clean) != 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Guess must be exactly 5 letters."
            )

        dictionary = get_dictionary()
        if not dictionary.is_valid_guess(guess_clean):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"'{guess_clean}' is not in the valid word dictionary."
            )

        # Check duplicate guess in same session
        for prev_move in session.moves:
            if prev_move.guess_word == guess_clean:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"You already guessed '{guess_clean}' in this game."
                )

        # Evaluate guess against target word
        eval_result = evaluate_guess(guess_clean, session.target_word)
        
        # Prepare feedback json
        feedback_json = [
            {"index": fb.index, "letter": fb.letter, "status": fb.status.value}
            for fb in eval_result.feedback
        ]

        # Update timing and attempts
        session.attempts_used += 1
        session.time_elapsed_seconds += max(1, seconds_taken)
        session.total_bulls_found += eval_result.bulls_count
        session.total_bears_found += eval_result.bears_count

        # Create GuessMove record
        move = GuessMove(
            session_id=session.id,
            move_number=session.attempts_used,
            guess_word=guess_clean,
            feedback=feedback_json,
            bulls_count=eval_result.bulls_count,
            bears_count=eval_result.bears_count,
            seconds_taken=seconds_taken
        )
        db.add(move)
        session.moves.append(move)

        # Fetch user current streak if authenticated
        current_streak = 0
        user = None
        if session.user_id:
            user_stmt = select(User).where(User.id == session.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalar_one_or_none()
            if user:
                current_streak = user.current_streak

        # Check Win / Loss conditions
        if eval_result.is_correct:
            # Won the game!
            score_data = calculate_score(
                is_win=True,
                attempts_used=session.attempts_used,
                max_attempts=session.max_attempts,
                time_elapsed_seconds=session.time_elapsed_seconds,
                time_limit_seconds=session.time_limit_seconds,
                total_bulls_discovered=session.total_bulls_found,
                total_bears_discovered=session.total_bears_found,
                current_streak=current_streak,
                game_mode=session.mode
            )
            session.status = "won"
            session.final_score = score_data.total_score
            session.score_breakdown = score_data.model_dump()
            session.completed_at = datetime.now(timezone.utc)

            # Update User Account Stats
            if user:
                user.games_played += 1
                user.games_won += 1
                user.total_score += session.final_score
                user.current_streak += 1
                if user.current_streak > user.max_streak:
                    user.max_streak = user.current_streak
                if session.final_score > user.best_score:
                    user.best_score = session.final_score
                if user.fastest_win_seconds == 0 or session.time_elapsed_seconds < user.fastest_win_seconds:
                    user.fastest_win_seconds = session.time_elapsed_seconds
                user.update_rank()

        elif session.attempts_used >= session.max_attempts or session.time_elapsed_seconds >= session.time_limit_seconds:
            # Lost the game
            score_data = calculate_score(
                is_win=False,
                attempts_used=session.attempts_used,
                max_attempts=session.max_attempts,
                time_elapsed_seconds=session.time_elapsed_seconds,
                time_limit_seconds=session.time_limit_seconds,
                total_bulls_discovered=session.total_bulls_found,
                total_bears_discovered=session.total_bears_found,
                current_streak=current_streak,
                game_mode=session.mode
            )
            session.status = "lost"
            session.final_score = score_data.total_score
            session.score_breakdown = score_data.model_dump()
            session.completed_at = datetime.now(timezone.utc)

            # Update User Account Stats
            if user:
                user.games_played += 1
                user.current_streak = 0  # reset streak on loss
                user.total_score += session.final_score
                user.update_rank()

        if session.status in ("won", "lost") and user:
            await AchievementService.evaluate_game_achievements(db, user, session)

        await db.commit()
        await db.refresh(session)
        return session

    @staticmethod
    async def abandon_game(db: AsyncSession, session_id: str, user_id: Optional[str] = None) -> GameSession:
        session = await GameService.get_session_by_id(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Game session not found.")

        if session.status != "in_progress":
            return session

        session.status = "abandoned"
        session.completed_at = datetime.now(timezone.utc)
        score_data = calculate_score(
            is_win=False,
            attempts_used=session.attempts_used,
            max_attempts=session.max_attempts,
            time_elapsed_seconds=session.time_elapsed_seconds,
            time_limit_seconds=session.time_limit_seconds,
            total_bulls_discovered=session.total_bulls_found,
            total_bears_discovered=session.total_bears_found,
            game_mode=session.mode
        )
        session.final_score = score_data.total_score
        session.score_breakdown = score_data.model_dump()

        if session.user_id:
            user_stmt = select(User).where(User.id == session.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalar_one_or_none()
            if user:
                user.games_played += 1
                user.current_streak = 0
                user.update_rank()

        await db.commit()
        await db.refresh(session)
        return session
