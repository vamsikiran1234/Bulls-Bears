"""
Competitive Leaderboard Ranking Service.
"""

from typing import List, Optional
from sqlalchemy import select, desc, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.game import GameSession
from app.schemas.leaderboard import LeaderboardEntryOut, LeaderboardResponse


class LeaderboardService:
    @staticmethod
    async def get_leaderboard(
        db: AsyncSession,
        period: str = "all_time",
        mode: str = "all",
        sort_by: str = "total_score",
        limit: int = 50,
        offset: int = 0,
        current_user_id: Optional[str] = None
    ) -> LeaderboardResponse:
        """
        Retrieves global competitive player leaderboard with user position calculation.
        """
        # Determine sorting column
        sort_col = User.total_score
        if sort_by == "win_rate":
            sort_col = User.games_won
        elif sort_by == "current_streak":
            sort_col = User.current_streak
        elif sort_by == "best_score":
            sort_col = User.best_score

        # Query active players
        query = select(User).where(User.games_played > 0).order_by(desc(sort_col), desc(User.games_won)).offset(offset).limit(limit)
        res = await db.execute(query)
        users = res.scalars().all()

        # Count total players
        count_stmt = select(func.count(User.id)).where(User.games_played > 0)
        count_res = await db.execute(count_stmt)
        total_players = count_res.scalar() or 0

        entries: List[LeaderboardEntryOut] = []
        user_rank: Optional[int] = None

        for idx, u in enumerate(users):
            rank = offset + idx + 1
            if current_user_id and u.id == current_user_id:
                user_rank = rank

            win_rate = round((u.games_won / u.games_played * 100), 1) if u.games_played > 0 else 0.0
            entries.append(
                LeaderboardEntryOut(
                    rank=rank,
                    user_id=u.id,
                    username=u.username,
                    display_name=u.display_name,
                    avatar_seed=u.avatar_seed,
                    rank_title=u.rank_title,
                    total_score=u.total_score,
                    games_played=u.games_played,
                    games_won=u.games_won,
                    win_rate=win_rate,
                    current_streak=u.current_streak,
                    best_score=u.best_score,
                    fastest_win_seconds=u.fastest_win_seconds
                )
            )

        # If current user is not in top slice, calculate their exact rank
        if current_user_id and user_rank is None:
            curr_user_stmt = select(User).where(User.id == current_user_id)
            curr_res = await db.execute(curr_user_stmt)
            curr_user = curr_res.scalar_one_or_none()
            if curr_user and curr_user.games_played > 0:
                higher_rank_stmt = select(func.count(User.id)).where(
                    and_(User.games_played > 0, sort_col > getattr(curr_user, sort_by if hasattr(curr_user, sort_by) else "total_score"))
                )
                hr_res = await db.execute(higher_rank_stmt)
                user_rank = (hr_res.scalar() or 0) + 1

        return LeaderboardResponse(
            period=period,
            mode=mode,
            total_players=total_players,
            user_rank=user_rank,
            entries=entries
        )
