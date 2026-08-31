import pytest
from httpx import AsyncClient
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


@pytest.mark.asyncio
async def test_argon2id_hashing():
    raw = "TraderSecretPass123!"
    hashed = hash_password(raw)
    assert hashed.startswith("$argon2id$")
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


@pytest.mark.asyncio
async def test_jwt_token_lifecycle():
    user_id = "test-trader-uuid-1234"
    token = create_access_token(user_id)
    decoded_id = decode_access_token(token)
    assert decoded_id == user_id
    assert decode_access_token("invalid.token.str") is None


@pytest.mark.asyncio
async def test_user_registration_and_login(client: AsyncClient):
    # Register user
    reg_payload = {
        "username": "bullish_trader",
        "email": "bullish@wallstreet.com",
        "password": "Password123!",
        "display_name": "Bullish Trader",
        "avatar_seed": "bull-2"
    }
    res = await client.post("/api/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "bullish_trader"
    assert data["user"]["rank_title"] == "Novice Trader"
    token = data["access_token"]

    # Duplicate register should fail
    res_dup = await client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400

    # Login with correct password
    login_res = await client.post("/api/auth/login", json={
        "username": "bullish_trader",
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # Login with email
    login_email = await client.post("/api/auth/login", json={
        "username": "bullish@wallstreet.com",
        "password": "Password123!"
    })
    assert login_email.status_code == 200

    # Login with wrong password
    login_fail = await client.post("/api/auth/login", json={
        "username": "bullish_trader",
        "password": "WrongPassword!"
    })
    assert login_fail.status_code == 401

    # Test /api/auth/me
    me_res = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "bullish_trader"

    # Update profile
    patch_res = await client.patch("/api/auth/profile", json={
        "display_name": "Alpha Bull",
        "avatar_seed": "bull-5"
    }, headers={"Authorization": f"Bearer {token}"})
    assert patch_res.status_code == 200
    assert patch_res.json()["display_name"] == "Alpha Bull"
    assert patch_res.json()["avatar_seed"] == "bull-5"


@pytest.mark.asyncio
async def test_guest_stats_sync(client: AsyncClient):
    # Register new user
    reg_payload = {
        "username": "guest_convert",
        "email": "convert@test.com",
        "password": "Password123!"
    }
    res = await client.post("/api/auth/register", json=reg_payload)
    token = res.json()["access_token"]

    # Sync offline guest games
    guest_payload = {
        "guest_games": [
            {
                "mode": "classic",
                "status": "won",
                "attempts_used": 3,
                "time_elapsed_seconds": 45,
                "final_score": 2500,
                "total_bulls": 5,
                "total_bears": 2
            },
            {
                "mode": "classic",
                "status": "won",
                "attempts_used": 2,
                "time_elapsed_seconds": 30,
                "final_score": 3200,
                "total_bulls": 5,
                "total_bears": 1
            }
        ]
    }
    sync_res = await client.post("/api/auth/guest-sync", json=guest_payload, headers={"Authorization": f"Bearer {token}"})
    assert sync_res.status_code == 200
    user_data = sync_res.json()
    assert user_data["games_played"] == 2
    assert user_data["games_won"] == 2
    assert user_data["total_score"] == 5700
    assert user_data["best_score"] == 3200
    assert user_data["current_streak"] == 2
    assert user_data["fastest_win_seconds"] == 30
    assert user_data["rank_title"] == "Floor Trader"
