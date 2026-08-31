"""
Pytest configuration and fixtures.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from app.core.database import Base, get_db
from app.main import app, DEFAULT_ACHIEVEMENTS
from app.models.achievement import Achievement

# In-memory async SQLite engine for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture(autouse=True)
async def prepare_test_db():
    """Create fresh database tables for each test and seed initial data."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    # Seed achievements into test db
    async with TestAsyncSessionLocal() as session:
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

    # Override get_db dependency
    async def override_get_db():
        async with TestAsyncSessionLocal() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client():
    """Async HTTP client for testing endpoints."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
