"""
Pydantic Schemas for Achievements.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AchievementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    code: str
    title: str
    description: str
    icon_name: str
    category: str
    points: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None


class UserAchievementOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    achievement_code: str
    unlocked_at: datetime
    achievement: AchievementOut
