# Bulls & Bears Word Puzzle Platform — REST API Specification

<div align="center">
  <img src="https://img.shields.io/badge/API-RESTful%20JSON-10b981?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Badge" />
  <img src="https://img.shields.io/badge/AUTHENTICATION-JWT%20BEARER-f59e0b?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Badge" />
  <img src="https://img.shields.io/badge/BASE_URL-http%3A%2F%2Flocalhost%3A8000%2Fapi-38bdf8?style=for-the-badge" alt="Base URL" />
</div>

---

## 1. Overview & Protocol Standards

The **Bulls & Bears REST API** powers all gameplay interactions, player accounts, real-time leaderboard computations, telemetry recording, and achievement tracking. Built on **FastAPI** with asynchronous SQLAlchemy 2.0 ORM, it ensures sub-10ms response times for all puzzle operations.

### 1.1 Base Configuration
* **Base URL**: `http://localhost:8000/api`
* **Default Encoding**: `UTF-8`
* **Content-Type**: `application/json`
* **CORS Allowed**: Configurable via `CORS_ORIGINS` in `.env` (defaults to frontend ports `5173`, `3000`)
* **Interactive Docs**: Swagger UI available at `http://localhost:8000/docs`, ReDoc at `http://localhost:8000/redoc`

### 1.2 Authentication Specification
All authenticated requests must include the JWT access token in the `Authorization` header using the standard Bearer scheme:
```http
Authorization: Bearer <your_jwt_access_token>
```
* **Algorithm**: `HS256`
* **Token Expiry**: 7 days (configurable)
* **Optional Authentication**: Gameplay endpoints (`/games/*`, `/leaderboard`, `/achievements`) accept requests both with and without authentication. Anonymous gameplay is fully supported; guest sessions can be merged into a permanent account via `/auth/guest-sync`.

---

## 2. Standard HTTP Status Codes

| Code | Status | Meaning |
| :--- | :--- | :--- |
| `200` | OK | Request processed successfully. |
| `201` | Created | Resource created (e.g. user registered, game session started). |
| `400` | Bad Request | Validation error, illegal guess length, game already completed. |
| `401` | Unauthorized | Missing or expired JWT Bearer token. |
| `404` | Not Found | Requested entity (session ID, user ID, replay) does not exist. |
| `422` | Unprocessable Entity | Pydantic payload schema validation failure. |
| `500` | Internal Server Error | Unhandled server exception. |

---

## 3. Authentication Endpoints (`/api/auth`)

### 3.1 Register New Trader
Create a permanent account on the trading floor.

* **Method**: `POST`
* **Path**: `/api/auth/register`
* **Auth Required**: No

#### Request Payload
```json
{
  "username": "GordonGekko",
  "email": "gekko@wallstreet.com",
  "password": "GreedIsGood2026!",
  "display_name": "Gordon G.",
  "avatar_seed": "trader-gekko"
}
```

#### Response (`201 Created`)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "e9b5f928-8422-4912-9c17-4384bfb8d5a1",
    "username": "GordonGekko",
    "email": "gekko@wallstreet.com",
    "display_name": "Gordon G.",
    "avatar_seed": "trader-gekko",
    "rank_title": "Retail Trader",
    "total_score": 0,
    "games_played": 0,
    "games_won": 0,
    "current_streak": 0,
    "max_streak": 0,
    "best_score": 0,
    "fastest_win_seconds": null,
    "win_rate": 0.0,
    "created_at": "2026-10-03T10:00:00Z"
  }
}
```

---

### 3.2 Login Trader
Authenticate an existing trader and acquire an active session token.

* **Method**: `POST`
* **Path**: `/api/auth/login`
* **Auth Required**: No

#### Request Payload
```json
{
  "username_or_email": "GordonGekko",
  "password": "GreedIsGood2026!"
}
```

#### Response (`200 OK`)
Returns token and current player profile identical to `TokenResponse` above.

---

### 3.3 Get Current Trader Profile
Retrieve the authenticated trader's updated stats, win streak, and rank title.

* **Method**: `GET`
* **Path**: `/api/auth/me`
* **Auth Required**: Yes (`Bearer <token>`)

#### Response (`200 OK`)
```json
{
  "id": "e9b5f928-8422-4912-9c17-4384bfb8d5a1",
  "username": "GordonGekko",
  "email": "gekko@wallstreet.com",
  "display_name": "Gordon G.",
  "avatar_seed": "trader-gekko",
  "rank_title": "Junior Analyst",
  "total_score": 1250,
  "games_played": 5,
  "games_won": 4,
  "current_streak": 3,
  "max_streak": 3,
  "best_score": 1420,
  "fastest_win_seconds": 24,
  "win_rate": 80.0,
  "created_at": "2026-10-03T10:00:00Z"
}
```

---

### 3.4 Sync Guest Play Progress
Merge anonymous stats accumulated during guest sessions into the authenticated account.

* **Method**: `POST`
* **Path**: `/api/auth/guest-sync`
* **Auth Required**: Yes (`Bearer <token>`)

#### Request Payload
```json
{
  "guest_games_played": 3,
  "guest_games_won": 3,
  "guest_total_score": 3400,
  "guest_best_score": 1350,
  "guest_fastest_win": 19,
  "guest_streak": 3
}
```

#### Response (`200 OK`)
Returns merged `UserOut` with recalculated rank and career points.

---

## 4. Gameplay Endpoints (`/api/games`)

### 4.1 Start New Game Session
Initializes a new puzzle session for Classic, Blitz, or Zen game modes.

* **Method**: `POST`
* **Path**: `/api/games/new`
* **Auth Required**: Optional (Guest allowed)

#### Request Payload
```json
{
  "mode": "classic"
}
```
*Available modes: `"classic"`, `"blitz"`, `"zen"`.*

#### Response (`201 Created`)
```json
{
  "id": "7f8b9e12-4c21-4f93-b1d5-862a98f1023a",
  "mode": "classic",
  "status": "in_progress",
  "attempts_used": 0,
  "max_attempts": 6,
  "time_limit_seconds": 120,
  "time_elapsed_seconds": 0,
  "final_score": 0,
  "score_breakdown": null,
  "total_bulls_found": 0,
  "total_bears_found": 0,
  "moves": [],
  "started_at": "2026-10-03T10:15:00Z",
  "completed_at": null,
  "target_word": null
}
```
> [!NOTE]
> `target_word` is strictly hidden by the server while `status == "in_progress"` to prevent client-side inspection cheats. It is only revealed when the game concludes (`status == "won"` or `status == "lost"`).

---

### 4.2 Get or Start Today's Daily Market Puzzle
Fetches today's global puzzle for the current UTC date. If the player hasn't started it yet, creates the session with the shared daily target word.

* **Method**: `GET`
* **Path**: `/api/games/daily/today`
* **Auth Required**: Optional

#### Response (`200 OK`)
Returns the active `GameSessionOut` configured for today's daily puzzle (`mode: "daily"`, `daily_date: "2026-10-03"`).

---

### 4.3 Submit Guess
Executes a 5-letter word guess against the secret target word.

* **Method**: `POST`
* **Path**: `/api/games/{session_id}/guess`
* **Auth Required**: Optional

#### Request Payload
```json
{
  "guess": "TRADE",
  "seconds_taken": 8
}
```

#### Response (`200 OK`)
```json
{
  "id": "7f8b9e12-4c21-4f93-b1d5-862a98f1023a",
  "mode": "classic",
  "status": "in_progress",
  "attempts_used": 1,
  "max_attempts": 6,
  "time_limit_seconds": 120,
  "time_elapsed_seconds": 8,
  "final_score": 0,
  "total_bulls_found": 2,
  "total_bears_found": 1,
  "moves": [
    {
      "id": "move-001",
      "move_number": 1,
      "guess_word": "TRADE",
      "feedback": [
        {"index": 0, "letter": "T", "status": "BULL"},
        {"index": 1, "letter": "R", "status": "MISS"},
        {"index": 2, "letter": "A", "status": "BEAR"},
        {"index": 3, "letter": "D", "status": "MISS"},
        {"index": 4, "letter": "E", "status": "BULL"}
      ],
      "bulls_count": 2,
      "bears_count": 1,
      "seconds_taken": 8
    }
  ],
  "target_word": null
}
```

#### Winning Response (5 Bulls):
When all 5 letters match (`bulls_count == 5`), the session transitions to `won`:
```json
{
  "id": "7f8b9e12-4c21-4f93-b1d5-862a98f1023a",
  "status": "won",
  "attempts_used": 3,
  "final_score": 1850,
  "score_breakdown": {
    "base_points": 1000,
    "attempt_bonus": 750,
    "speed_bonus": 100,
    "streak_multiplier": 1.1
  },
  "target_word": "TABLE"
}
```

---

### 4.4 Abandon Game
Forfeits an active game session, recording it as a loss and revealing the secret target word.

* **Method**: `POST`
* **Path**: `/api/games/{session_id}/abandon`
* **Auth Required**: Optional

---

## 5. Leaderboard Endpoints (`/api/leaderboard`)

### 5.1 Query Ranked Standings
Retrieve ranked players with customizable sorting and timeframes.

* **Method**: `GET`
* **Path**: `/api/leaderboard`
* **Auth Required**: Optional

#### Query Parameters
| Parameter | Type | Default | Choices / Format | Description |
| :--- | :--- | :--- | :--- | :--- |
| `period` | string | `all_time` | `all_time`, `weekly`, `daily` | Time window for ranking |
| `mode` | string | `all` | `all`, `classic`, `blitz`, `daily` | Game mode filter |
| `sort_by` | string | `total_score` | `total_score`, `win_rate`, `current_streak`, `best_score` | Ranking metric |
| `limit` | integer| `50` | `1` to `100` | Page size |
| `offset` | integer| `0` | $\ge 0$ | Pagination offset |

#### Response (`200 OK`)
```json
{
  "period": "all_time",
  "mode": "all",
  "sort_by": "total_score",
  "total_traders": 1420,
  "entries": [
    {
      "rank": 1,
      "user_id": "9a12c418-4b21...",
      "username": "BullishWhale",
      "display_name": "Wall St. Oracle",
      "avatar_seed": "whale-avatar",
      "rank_title": "Wall Street Legend",
      "total_score": 84250,
      "games_won": 92,
      "games_played": 98,
      "win_rate": 93.9,
      "current_streak": 24,
      "best_score": 2850,
      "fastest_win_seconds": 11
    }
  ],
  "my_rank": 14
}
```

---

## 6. Achievements Endpoints (`/api/achievements`)

### 6.1 List All Badges & Unlock Progress
Fetches all 13 Wall Street trading achievements, showing whether the authenticated user has unlocked them and their current progress.

* **Method**: `GET`
* **Path**: `/api/achievements`
* **Auth Required**: Optional

#### Response (`200 OK`)
```json
[
  {
    "code": "FIRST_TRADE",
    "title": "Opening Bell",
    "description": "Win your first Bulls & Bears word puzzle.",
    "icon_name": "Bell",
    "category": "milestone",
    "points": 50,
    "is_unlocked": true,
    "unlocked_at": "2026-10-01T14:22:10Z",
    "progress_percent": 100
  },
  {
    "code": "WALL_STREET_LEGEND",
    "title": "Wall Street Legend",
    "description": "Achieve a winning streak of 10 games.",
    "icon_name": "Crown",
    "category": "streak",
    "points": 300,
    "is_unlocked": false,
    "unlocked_at": null,
    "progress_percent": 70
  }
]
```

---

## 7. Performance & Replay Telemetry (`/api/analytics`)

### 7.1 My Career Analytics
Detailed performance telemetry including guess distribution and bulls/bears accuracy.

* **Method**: `GET`
* **Path**: `/api/analytics/me`
* **Auth Required**: Yes (`Bearer <token>`)

#### Response (`200 OK`)
```json
{
  "user_id": "e9b5f928-8422-4912-9c17-4384bfb8d5a1",
  "username": "GordonGekko",
  "games_played": 42,
  "games_won": 38,
  "win_rate": 90.5,
  "current_streak": 8,
  "max_streak": 14,
  "total_score": 42800,
  "average_score": 1126,
  "fastest_win_seconds": 14,
  "average_time_seconds": 43.2,
  "guess_distribution": {
    "1": 1,
    "2": 6,
    "3": 18,
    "4": 10,
    "5": 3,
    "6": 0
  },
  "total_bulls": 142,
  "total_bears": 98
}
```

---

### 7.2 Game Telemetry Replay
Fetch full turn-by-turn replay data to visualize past matches.

* **Method**: `GET`
* **Path**: `/api/analytics/replay/{session_id}`
* **Auth Required**: Optional

#### Response (`200 OK`)
```json
{
  "session_id": "7f8b9e12-4c21-4f93-b1d5-862a98f1023a",
  "mode": "classic",
  "status": "won",
  "target_word": "TABLE",
  "attempts_used": 3,
  "time_elapsed_seconds": 32,
  "final_score": 1850,
  "completed_at": "2026-10-03T10:15:32Z",
  "moves": [
    {
      "move_number": 1,
      "guess_word": "TRADE",
      "feedback": [...],
      "bulls_count": 2,
      "bears_count": 1,
      "seconds_taken": 10
    },
    {
      "move_number": 2,
      "guess_word": "TIGER",
      "feedback": [...],
      "bulls_count": 1,
      "bears_count": 0,
      "seconds_taken": 12
    },
    {
      "move_number": 3,
      "guess_word": "TABLE",
      "feedback": [...],
      "bulls_count": 5,
      "bears_count": 0,
      "seconds_taken": 10
    }
  ]
}
```

---

## 8. cURL Request Quick Reference

```bash
# 1. Register a new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"TraderJoe","email":"joe@market.com","password":"Password123!"}'

# 2. Start a new Classic Game
curl -X POST http://localhost:8000/api/games/new \
  -H "Content-Type: application/json" \
  -d '{"mode":"classic"}'

# 3. Submit a guess
curl -X POST http://localhost:8000/api/games/<SESSION_ID>/guess \
  -H "Content-Type: application/json" \
  -d '{"guess":"SMART","seconds_taken":12}'

# 4. Fetch Top 10 All-Time Leaderboard
curl "http://localhost:8000/api/leaderboard?period=all_time&limit=10"
```
