"""
Player Performance Analytics & Game Replay Service.
"""

from typing import List, Dict, Optional
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.models.game import GameSession, GuessMove
from app.schemas.analytics import (
    UserStatsAnalyticsOut,
    GuessDistributionItem,
    ScoreHistoryItem,
    GameReplayOut,
    GameReplayMove
)


class AnalyticsService:
    @staticmethod
    async def get_user_analytics(db: AsyncSession, user_id: str) -> UserStatsAnalyticsOut:
        # Load user
        user_stmt = select(User).where(User.id == user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        # Load completed game sessions
        stmt = select(GameSession).options(selectinload(GameSession.moves)).where(
            GameSession.user_id == user_id,
            GameSession.status.in_(["won", "lost", "abandoned"])
        ).order_by(desc(GameSession.started_at))
        res = await db.execute(stmt)
        sessions = res.scalars().all()

        total_games = len(sessions)
        wins = [s for s in sessions if s.status == "won"]
        win_rate = round((len(wins) / total_games * 100), 1) if total_games > 0 else 0.0

        # Attempt Distribution (1 through 6)
        dist_counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0}
        for w in wins:
            if 1 <= w.attempts_used <= 6:
                dist_counts[w.attempts_used] += 1

        dist_items: List[GuessDistributionItem] = []
        for att in range(1, 7):
            cnt = dist_counts[att]
            pct = round((cnt / len(wins) * 100), 1) if wins else 0.0
            dist_items.append(GuessDistributionItem(attempt_number=att, count=cnt, percentage=pct))

        # Averages
        avg_score = round(sum(s.final_score for s in sessions) / total_games, 1) if total_games > 0 else 0.0
        avg_time = round(sum(s.time_elapsed_seconds for s in wins) / len(wins), 1) if wins else 0.0
        avg_attempts = round(sum(s.attempts_used for s in wins) / len(wins), 1) if wins else 0.0

        # Accuracy Rates
        total_bulls = sum(s.total_bulls_found for s in sessions)
        total_bears = sum(s.total_bears_found for s in sessions)
        total_letters_guessed = sum(s.attempts_used * 5 for s in sessions)
        bull_accuracy = round((total_bulls / total_letters_guessed * 100), 1) if total_letters_guessed > 0 else 0.0
        bear_accuracy = round((total_bears / total_letters_guessed * 100), 1) if total_letters_guessed > 0 else 0.0

        # Score History (Last 30 games in chronological order for Recharts)
        history_items: List[ScoreHistoryItem] = []
        recent_sessions = list(reversed(sessions[:30]))
        for idx, s in enumerate(recent_sessions):
            history_items.append(
                ScoreHistoryItem(
                    game_id=s.id,
                    game_number=idx + 1,
                    score=s.final_score,
                    attempts=s.attempts_used,
                    time_seconds=s.time_elapsed_seconds,
                    is_win=(s.status == "won"),
                    mode=s.mode,
                    date=s.started_at.strftime("%b %d, %H:%M")
                )
            )

        return UserStatsAnalyticsOut(
            user_id=user.id,
            username=user.username,
            display_name=user.display_name,
            avatar_seed=user.avatar_seed,
            rank_title=user.rank_title,
            total_score=user.total_score,
            games_played=user.games_played,
            games_won=user.games_won,
            win_rate=win_rate,
            current_streak=user.current_streak,
            max_streak=user.max_streak,
            best_score=user.best_score,
            average_score=avg_score,
            average_solve_time=avg_time,
            average_attempts=avg_attempts,
            fastest_win_seconds=user.fastest_win_seconds,
            bull_accuracy_rate=bull_accuracy,
            bear_accuracy_rate=bear_accuracy,
            guess_distribution=dist_items,
            recent_history=history_items
        )

    @staticmethod
    async def get_game_replay(db: AsyncSession, session_id: str) -> GameReplayOut:
        stmt = select(GameSession).options(selectinload(GameSession.moves)).where(GameSession.id == session_id)
        res = await db.execute(stmt)
        session = res.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Game session not found.")

        replay_moves = [
            GameReplayMove(
                move_number=m.move_number,
                guess_word=m.guess_word,
                feedback=m.feedback,
                bulls_count=m.bulls_count,
                bears_count=m.bears_count,
                seconds_taken=m.seconds_taken
            )
            for m in session.moves
        ]

        return GameReplayOut(
            id=session.id,
            mode=session.mode,
            target_word=session.target_word,
            status=session.status,
            final_score=session.final_score,
            attempts_used=session.attempts_used,
            time_elapsed_seconds=session.time_elapsed_seconds,
            started_at=session.started_at,
            completed_at=session.completed_at,
            moves=replay_moves
        )
