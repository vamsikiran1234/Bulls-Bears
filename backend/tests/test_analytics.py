import pytest
from httpx import AsyncClient
from app.main import seed_achievements


@pytest.mark.asyncio
async def test_achievements_listing(client: AsyncClient):
    await seed_achievements()
    res = await client.get("/api/achievements")
    assert res.status_code == 200
    achs = res.json()
    assert len(achs) >= 10
    codes = [a["code"] for a in achs]
    assert "FIRST_TRADE" in codes
    assert "BULL_MARKET" in codes
    assert "WALL_STREET_LEGEND" in codes


@pytest.mark.asyncio
async def test_leaderboard_endpoint(client: AsyncClient):
    # Register 2 players
    p1 = await client.post("/api/auth/register", json={
        "username": "top_trader_1",
        "email": "top1@bulls.com",
        "password": "Password123!"
    })
    t1 = p1.json()["access_token"]

    p2 = await client.post("/api/auth/register", json={
        "username": "top_trader_2",
        "email": "top2@bulls.com",
        "password": "Password123!"
    })
    t2 = p2.json()["access_token"]

    # Give player 1 some stats
    await client.post("/api/auth/guest-sync", json={
        "guest_games": [
            {"mode": "classic", "status": "won", "attempts_used": 2, "time_elapsed_seconds": 25, "final_score": 4000, "total_bulls": 5, "total_bears": 1}
        ]
    }, headers={"Authorization": f"Bearer {t1}"})

    # Give player 2 stats
    await client.post("/api/auth/guest-sync", json={
        "guest_games": [
            {"mode": "classic", "status": "won", "attempts_used": 4, "time_elapsed_seconds": 50, "final_score": 2000, "total_bulls": 5, "total_bears": 2}
        ]
    }, headers={"Authorization": f"Bearer {t2}"})

    # Query leaderboard
    lb_res = await client.get("/api/leaderboard?sort_by=total_score", headers={"Authorization": f"Bearer {t1}"})
    assert lb_res.status_code == 200
    lb_data = lb_res.json()
    assert lb_data["total_players"] == 2
    assert lb_data["entries"][0]["username"] == "top_trader_1"
    assert lb_data["entries"][0]["total_score"] == 4000
    assert lb_data["entries"][1]["username"] == "top_trader_2"
    assert lb_data["entries"][1]["total_score"] == 2000
    assert lb_data["user_rank"] == 1


@pytest.mark.asyncio
async def test_user_performance_analytics_and_replay(client: AsyncClient):
    # Register user
    reg = await client.post("/api/auth/register", json={
        "username": "quant_trader",
        "email": "quant@trading.com",
        "password": "Password123!"
    })
    token = reg.json()["access_token"]
    user_id = reg.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # Start a game
    game = await client.post("/api/games/new", json={"mode": "classic"}, headers=headers)
    session_id = game.json()["id"]

    # Submit a guess
    await client.post(f"/api/games/{session_id}/guess", json={"guess": "TRADE", "seconds_taken": 12}, headers=headers)

    # Abandon game to complete it
    await client.post(f"/api/games/{session_id}/abandon", headers=headers)

    # Get analytics
    analytics_res = await client.get("/api/analytics/me", headers=headers)
    assert analytics_res.status_code == 200
    an_data = analytics_res.json()
    assert an_data["username"] == "quant_trader"
    assert len(an_data["guess_distribution"]) == 6
    assert len(an_data["recent_history"]) == 1

    # Get game replay
    replay_res = await client.get(f"/api/analytics/replay/{session_id}")
    assert replay_res.status_code == 200
    rp_data = replay_res.json()
    assert rp_data["id"] == session_id
    assert len(rp_data["moves"]) == 1
    assert rp_data["moves"][0]["guess_word"] == "TRADE"
