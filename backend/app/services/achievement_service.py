"""
Achievement Engine and Evaluator Service.
"""

from datetime import datetime, timezone
from typing import List, Set, Optional
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.achievement import Achievement, UserAchievement
from app.models.user import User
from app.models.game import GameSession, GuessMove
from app.schemas.achievement import AchievementOut


class AchievementService:
    @staticmethod
    async def evaluate_game_achievements(
        db: AsyncSession,
        user: User,
        session: GameSession
    ) -> List[str]:
        """
        Evaluates criteria after a game completes and unlocks achievements.
        Returns list of newly unlocked achievement codes.
        """
        if not user or not session.user_id:
            return []

        # Get existing unlocked achievement codes for user
        stmt = select(UserAchievement.achievement_code).where(UserAchievement.user_id == user.id)
        res = await db.execute(stmt)
        unlocked_codes: Set[str] = set(res.scalars().all())

        newly_unlocked: List[str] = []

        async def unlock(code: str):
            if code not in unlocked_codes:
                ach_stmt = select(Achievement).where(Achievement.code == code)
                ach_res = await db.execute(ach_stmt)
                ach = ach_res.scalar_one_or_none()
                if ach:
                    user_ach = UserAchievement(
                        user_id=user.id,
                        achievement_code=code,
                        unlocked_at=datetime.now(timezone.utc)
                    )
                    db.add(user_ach)
                    unlocked_codes.add(code)
                    newly_unlocked.append(code)

        # 1. FIRST_TRADE: Win your first game
        if session.status == "won" and user.games_won >= 1:
            await unlock("FIRST_TRADE")

        # 2. BULL_MARKET: Streak >= 3
        if user.current_streak >= 3:
            await unlock("BULL_MARKET")

        # 3. WALL_STREET_LEGEND: Streak >= 10
        if user.current_streak >= 10:
            await unlock("WALL_STREET_LEGEND")

        # 4. SPEED_TRADER: Win in under 30 seconds
        if session.status == "won" and session.time_elapsed_seconds > 0 and session.time_elapsed_seconds <= 30:
            await unlock("SPEED_TRADER")

        # 5. PERFECT_EXECUTION: Win on 1st guess
        if session.status == "won" and session.attempts_used == 1:
            await unlock("PERFECT_EXECUTION")

        # 6. SNIPER: Win on 2nd guess
        if session.status == "won" and session.attempts_used == 2:
            await unlock("SNIPER")

        # 7. BEAR_TRAP: Win on 6th guess
        if session.status == "won" and session.attempts_used == 6:
            await unlock("BEAR_TRAP")

        # 8. DAILY_PROFIT: Complete daily puzzle
        if session.mode == "daily" and session.status == "won":
            await unlock("DAILY_PROFIT")

        # 9. HIGH_ROLLER: Total score >= 5000
        if user.total_score >= 5000:
            await unlock("HIGH_ROLLER")

        # 10. MARKET_MAKER: Total score >= 25000
        if user.total_score >= 25000:
            await unlock("MARKET_MAKER")

        # 11. CENTURY_CLUB: 100 games played
        if user.games_played >= 100:
            await unlock("CENTURY_CLUB")

        # 12. ALL_BEARS: Any guess that yielded 5 bears and 0 bulls
        for m in session.moves:
            if m.bears_count == 5 and m.bulls_count == 0:
                await unlock("ALL_BEARS")
                break

        # 13. BLITZ_CHAMP: 5 wins in Blitz mode
        if session.mode == "blitz" and session.status == "won":
            blitz_wins_stmt = select(func.count(GameSession.id)).where(
                and_(
                    GameSession.user_id == user.id,
                    GameSession.mode == "blitz",
                    GameSession.status == "won"
                )
            )
            b_count_res = await db.execute(blitz_wins_stmt)
            if (b_count_res.scalar() or 0) >= 5:
                await unlock("BLITZ_CHAMP")

        if newly_unlocked:
            await db.commit()

        return newly_unlocked

    @staticmethod
    async def get_user_achievements(db: AsyncSession, user_id: Optional[str] = None) -> List[AchievementOut]:
        # Get all registered achievements
        stmt = select(Achievement).order_by(Achievement.points.asc())
        res = await db.execute(stmt)
        all_achs = res.scalars().all()

        unlocked_map = {}
        if user_id:
            u_stmt = select(UserAchievement).where(UserAchievement.user_id == user_id)
            u_res = await db.execute(u_stmt)
            for ua in u_res.scalars().all():
                unlocked_map[ua.achievement_code] = ua.unlocked_at

        out: List[AchievementOut] = []
        for a in all_achs:
            is_unlocked = a.code in unlocked_map
            out.append(
                AchievementOut(
                    code=a.code,
                    title=a.title,
                    description=a.description,
                    icon_name=a.icon_name,
                    category=a.category,
                    points=a.points,
                    unlocked=is_unlocked,
                    unlocked_at=unlocked_map.get(a.code)
                )
            )
        return out
