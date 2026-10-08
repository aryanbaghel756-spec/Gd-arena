# Contract Requests & UI Expansion RFC - GD Arena

This document details frontend UI requirements that extend beyond the core AI turn-taking and STT endpoints described in `docs/API_CONTRACT.md`.

In accordance with frontend/backend boundaries, the frontend does **not** assume these endpoints exist. When they are absent, the frontend provides fully functional client-side mock implementations (e.g. LocalStorage session persistence, heuristic analytics engine, and mock demo auth).

---

## 1. Session History Persistence

### Proposed Endpoints
- `GET /api/sessions` ➔ Fetch previous discussion sessions for the current student.
- `POST /api/sessions` ➔ Persist completed session transcript, audio metrics, and feedback report.
- `GET /api/sessions/:id` ➔ Retrieve specific historical audit report.

### Frontend Fallback Behavior
- The frontend stores completed discussion sessions in client-side state / `localStorage` under `gd_arena_sessions`.
- A seeded set of realistic mock sessions is provided out-of-the-box so the Dashboard and History screens feel fully populated and credible during demos.

---

## 2. Authentication & User Profile

### Proposed Endpoints
- `POST /api/auth/login` ➔ User sign-in with email & password.
- `POST /api/auth/register` ➔ New student account registration.
- `GET /api/auth/profile` ➔ Active user profile details (name, college, target exam/interview).

### Frontend Fallback Behavior
- The frontend includes a **"Continue as Demo User"** flow which creates an in-memory session for student `"Aryan Sharma"`.
- Form inputs validate client-side with feedback cues without blocking demo users or judges.

---

## 3. Longitudinal Insights & Skill Trends

### Proposed Endpoint
- `GET /api/insights/summary` ➔ Aggregated cross-session progress (average scores, cumulative speaking time, progress across 5 competencies).

### Frontend Fallback Behavior
- The frontend calculates rolling averages directly from stored discussion sessions.
