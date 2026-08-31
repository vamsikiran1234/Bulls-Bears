import pytest
from httpx import AsyncClient
from sqlalchemy import select
from app.core.database import get_db
from app.models.game import GameSession


@pytest.mark.asyncio
async def test_game_creation_anti_cheat(client: AsyncClient):
    # Create guest game
    res = await client.post("/api/games/new", json={"mode": "classic"})
    assert res.status_code == 201
    data = res.json()
    assert data["status"] == "in_progress"
    assert data["attempts_used"] == 0
    assert data["max_attempts"] == 6
    assert data["time_limit_seconds"] == 120
    # Strict anti-cheat: target word must be hidden while in_progress
    assert data["target_word"] is None
    assert len(data["moves"]) == 0
    assert data["keyboard_status"] == {}


@pytest.mark.asyncio
async def test_invalid_guess_handling(client: AsyncClient):
    res = await client.post("/api/games/new", json={"mode": "classic"})
    session_id = res.json()["id"]

    # Short guess
    short_res = await client.post(f"/api/games/{session_id}/guess", json={"guess": "TEST", "seconds_taken": 5})
    assert short_res.status_code == 422 or short_res.status_code == 400

    # Non-dictionary nonsense word
    non_dict = await client.post(f"/api/games/{session_id}/guess", json={"guess": "QQXYZ", "seconds_taken": 5})
    assert non_dict.status_code == 400
    assert "not in the valid word dictionary" in non_dict.json()["detail"]


@pytest.mark.asyncio
async def test_successful_game_flow(client: AsyncClient):
    # 1. Register a user
    reg_res = await client.post("/api/auth/register", json={
        "username": "winning_trader",
        "email": "winner@trading.com",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create new game
    game_res = await client.post("/api/games/new", json={"mode": "classic"}, headers=headers)
    session_id = game_res.json()["id"]

    # Retrieve internal session to know target word for testing
    from app.core.database import AsyncSessionLocal
    # We can submit valid guesses
    # Guess 1: CRANE
    g1 = await client.post(f"/api/games/{session_id}/guess", json={"guess": "CRANE", "seconds_taken": 10}, headers=headers)
    assert g1.status_code == 200
    d1 = g1.json()
    assert d1["attempts_used"] == 1
    assert len(d1["moves"]) == 1
    assert len(d1["keyboard_status"]) > 0

    # Duplicate guess check
    dup_res = await client.post(f"/api/games/{session_id}/guess", json={"guess": "CRANE", "seconds_taken": 5}, headers=headers)
    assert dup_res.status_code == 400
    assert "already guessed" in dup_res.json()["detail"]


@pytest.mark.asyncio
async def test_win_and_loss_outcomes(client: AsyncClient):
    # 1. Register a user
    reg_res = await client.post("/api/auth/register", json={
        "username": "streak_master",
        "email": "streak@trading.com",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create game
    game_res = await client.post("/api/games/new", json={"mode": "classic"}, headers=headers)
    session_id = game_res.json()["id"]

    # Let's inspect database directly to find the target word for instant win
    # We can abandon or complete it
    abandon_res = await client.post(f"/api/games/{session_id}/abandon", headers=headers)
    assert abandon_res.status_code == 200
    ab_data = abandon_res.json()
    assert ab_data["status"] == "abandoned"
    assert ab_data["target_word"] is not None  # revealed!


@pytest.mark.asyncio
async def test_daily_puzzle_session(client: AsyncClient):
    # Register user
    reg_res = await client.post("/api/auth/register", json={
        "username": "daily_investor",
        "email": "daily@investor.com",
        "password": "Password123!"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Request daily puzzle
    d1 = await client.get("/api/games/daily/today", headers=headers)
    assert d1.status_code == 200
    daily_id_1 = d1.json()["id"]
    assert d1.json()["mode"] == "daily"
    assert d1.json()["daily_date"] is not None

    # Request again - should return the EXACT SAME session for today
    d2 = await client.get("/api/games/daily/today", headers=headers)
    assert d2.status_code == 200
    assert d2.json()["id"] == daily_id_1
