"""
Bulls & Bears Word Puzzle Platform — Backend Application.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import init_db, AsyncSessionLocal
from app.api.auth import router as auth_router
from app.api.games import router as games_router
from app.api.leaderboard import router as leaderboard_router
from app.api.achievements import router as achievements_router
from app.api.analytics import router as analytics_router
from app.models.achievement import Achievement


DEFAULT_ACHIEVEMENTS = [
    {"code": "FIRST_TRADE", "title": "Opening Bell", "description": "Win your first Bulls & Bears word puzzle.", "icon_name": "Bell", "category": "milestone", "points": 50},
    {"code": "BULL_MARKET", "title": "Bull Market Rally", "description": "Achieve a winning streak of 3 games.", "icon_name": "TrendingUp", "category": "streak", "points": 100},
    {"code": "WALL_STREET_LEGEND", "title": "Wall Street Legend", "description": "Achieve a winning streak of 10 games.", "icon_name": "Crown", "category": "streak", "points": 300},
    {"code": "SPEED_TRADER", "title": "Flash Crash Solver", "description": "Solve a puzzle in under 30 seconds.", "icon_name": "Zap", "category": "speed", "points": 150},
    {"code": "PERFECT_EXECUTION", "title": "Insider Insight", "description": "Solve a puzzle on your very first guess (Golden Bull).", "icon_name": "Target", "category": "accuracy", "points": 500},
    {"code": "SNIPER", "title": "Market Sniper", "description": "Solve a puzzle in exactly 2 guesses.", "icon_name": "Crosshair", "category": "accuracy", "points": 200},
    {"code": "BEAR_TRAP", "title": "Bear Trap Escape", "description": "Win a game on your 6th (final) attempt.", "icon_name": "ShieldAlert", "category": "survival", "points": 100},
    {"code": "DAILY_PROFIT", "title": "Daily Dividend", "description": "Complete today's Daily Market Puzzle.", "icon_name": "Calendar", "category": "daily", "points": 75},
    {"code": "HIGH_ROLLER", "title": "High Roller", "description": "Accumulate over 5,000 total score points.", "icon_name": "DollarSign", "category": "score", "points": 150},
    {"code": "MARKET_MAKER", "title": "Market Maker Status", "description": "Accumulate over 25,000 total score points.", "icon_name": "Award", "category": "score", "points": 500},
    {"code": "CENTURY_CLUB", "title": "Century Club", "description": "Play 100 complete games on the platform.", "icon_name": "Clock", "category": "dedication", "points": 250},
    {"code": "ALL_BEARS", "title": "Full Bearish Shift", "description": "Make a guess that yields 5 Bears and 0 Bulls.", "icon_name": "Shuffle", "category": "quirk", "points": 100},
    {"code": "BLITZ_CHAMP", "title": "High Frequency Trader", "description": "Win 5 games in Blitz / Speed Trading Mode.", "icon_name": "Flame", "category": "blitz", "points": 200},
]


async def seed_achievements():
    async with AsyncSessionLocal() as session:
        for ach in DEFAULT_ACHIEVEMENTS:
            stmt = select(Achievement).where(Achievement.code == ach["code"])
            res = await session.execute(stmt)
            if not res.scalar_one_or_none():
                new_ach = Achievement(
                    code=ach["code"],
                    title=ach["title"],
                    description=ach["description"],
                    icon_name=ach["icon_name"],
                    category=ach["category"],
                    points=ach["points"]
                )
                session.add(new_ach)
        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB and seeds
    await init_db()
    await seed_achievements()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="High-performance, financial-themed word puzzle gaming platform API.",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(games_router, prefix=settings.API_V1_PREFIX)
app.include_router(leaderboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(achievements_router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
