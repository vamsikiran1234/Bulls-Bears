"""
User Management and Authentication Service.
"""

from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.schemas.user import UserRegister, UserLogin, UserUpdate, GuestSyncRequest
from app.core.security import hash_password, verify_password, create_access_token


class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, user_in: UserRegister) -> User:
        # Check if username exists
        stmt = select(User).where(User.username == user_in.username)
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already registered."
            )

        # Check if email exists
        stmt = select(User).where(User.email == user_in.email)
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address is already registered."
            )

        # Create user with Argon2id hash
        hashed_pwd = hash_password(user_in.password)
        db_user = User(
            username=user_in.username,
            email=user_in.email,
            password_hash=hashed_pwd,
            display_name=user_in.display_name or user_in.username,
            avatar_seed=user_in.avatar_seed or "bull-1",
            rank_title="Novice Trader"
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def authenticate(db: AsyncSession, login_data: UserLogin) -> Optional[User]:
        # Allow login via username or email
        stmt = select(User).where(
            (User.username == login_data.username) | (User.email == login_data.username)
        )
        res = await db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user:
            return None
        if not verify_password(login_data.password, user.password_hash):
            return None

        # Update last login time
        user.last_login_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        return res.scalar_one_or_none()

    @staticmethod
    async def update_profile(db: AsyncSession, user_id: str, update_data: UserUpdate) -> User:
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        if update_data.display_name is not None:
            user.display_name = update_data.display_name
        if update_data.avatar_seed is not None:
            user.avatar_seed = update_data.avatar_seed

        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def sync_guest_stats(db: AsyncSession, user_id: str, sync_req: GuestSyncRequest) -> User:
        """Merge offline guest games into registered user profile."""
        user = await UserService.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")

        for g in sync_req.guest_games:
            user.games_played += 1
            user.total_score += g.final_score
            if g.final_score > user.best_score:
                user.best_score = g.final_score

            if g.status == "won":
                user.games_won += 1
                user.current_streak += 1
                if user.current_streak > user.max_streak:
                    user.max_streak = user.current_streak
                if user.fastest_win_seconds == 0 or (g.time_elapsed_seconds > 0 and g.time_elapsed_seconds < user.fastest_win_seconds):
                    user.fastest_win_seconds = g.time_elapsed_seconds
            else:
                user.current_streak = 0

        user.update_rank()
        await db.commit()
        await db.refresh(user)
        return user
