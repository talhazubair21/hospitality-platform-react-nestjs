# Hospitality bookings module

NestJS REST API + MongoDB, and a React (Vite) SPA for listing, creating, and updating bookings. Validation exists on both client and server; booking status changes follow rules enforced in the API.

---

## Prerequisites

- **Node.js** 20.19+ or **22.12+** (Vite and tooling expect a recent 20.x or 22.x)
- **MongoDB** reachable from your machine (local install or Atlas)
- **npm**

---

## Setup

1. **Install dependencies**

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Backend env** — copy the example and set your database URL:

   ```bash
   cd backend && cp .env.example .env
   ```

3. **Frontend env** (optional; defaults to `http://localhost:3000` in code if omitted):

   ```bash
   cd frontend && cp .env.example .env
   ```

4. Start MongoDB (or use Atlas), then run the API and UI (see [Run locally](#run-locally)).

---

## Environment variables

| Where          | File                                           | Variables                                                                                                                                      |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend        | `backend/.env`                                 | **`MONGODB_URI`** (required) — Mongo connection string. **`PORT`** (default `3000`). **`NODE_ENV`** — `development` \| `test` \| `production`. |
| Frontend       | `frontend/.env`                                | **`VITE_API_URL`** — API origin, no trailing path (e.g. `http://localhost:3000`).                                                              |
| Docker Compose | `.env` next to `docker-compose.yml` (optional) | **`MONGODB_URI`** — overrides the default below.                                                                                               |

**Docker default:** if you do not set `MONGODB_URI`, Compose uses `mongodb://host.docker.internal:27017/bookings` so the backend container can talk to MongoDB running on the host. Use a project `.env` or export `MONGODB_URI` for Atlas or another host.

Do not commit secrets; keep real connection strings only in local `.env` files.

---

## Run locally

| Step             | Command                                             | Notes                                           |
| ---------------- | --------------------------------------------------- | ----------------------------------------------- |
| API (dev)        | `cd backend && npm run start:dev`                   | Listens on `http://localhost:3000` (or `PORT`). |
| UI (dev)         | `cd frontend && npm run dev`                        | Usually `http://localhost:5173`.                |
| API (prod-style) | `cd backend && npm run build && npm run start:prod` |                                                 |
| UI build         | `cd frontend && npm run build`                      | Output in `frontend/dist/`.                     |

---

## Docker

MongoDB is **not** included; point `MONGODB_URI` at Mongo on the host or a remote URI.

```bash
# From repository root
docker compose up --build
```

- **Frontend:** `http://localhost:5173`
- **API:** `http://localhost:3000`

Detached: `docker compose up --build -d` · Stop: `docker compose down`

---

## Tests

| App      | Command                                                       | Scope                                                          |
| -------- | ------------------------------------------------------------- | -------------------------------------------------------------- |
| Backend  | `cd backend && npm test`                                      | Jest — booking service rules, DTO validation (no DB required). |
| Backend  | `npm run test:watch` · `npm run test:cov` · `npm run test:ci` | Watch, coverage, CI-friendly run.                              |
| Frontend | `cd frontend && npm test`                                     | Vitest — form schema, types, API error helpers.                |
| Frontend | `npm run test:watch` · `npm run test:cov`                     | Watch, coverage.                                               |

---

## Sample data

```bash
cd backend && npm run seed
```

- Requires **`MONGODB_URI`** in `backend/.env`.
- **Clears** the `bookings` collection, then inserts rows (e.g. Alex Rivera, Jordan Lee, Sam Patel, …) covering every **status** (`pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`).
- Script: `backend/scripts/seed-bookings.cjs`.

Optional static shapes for experiments: `frontend/src/data/mockBookings.ts` (the app normally uses the live API).

---

## Assumptions

- No authentication; API is open for local development.
- **Currency:** amounts are plain numbers; the UI may label as USD without a multi-currency model.
- **Dates:** stored as UTC in MongoDB; the UI formats for display.
- **Domain model:** flat bookings (guest, property name, dates, status, amount) — no separate User/Property services in this slice.
- **CORS:** wide open in Nest for dev; tighten for production.
- **Concurrency:** no special merge logic beyond typical MongoDB updates.

---

## Architecture (brief)

**Backend:** NestJS modules split HTTP (`BookingsController`) from rules (`BookingsService`). Mongoose persists bookings; list sort is **newest first** (`createdAt` descending). DTOs + `ValidationPipe` validate bodies; **Joi** validates env at startup. Status transitions live in one place in the service so behavior stays consistent.

**Frontend:** Vite + React Router; **TanStack Query** for server state; **Axios** with a shared base URL from **`VITE_API_URL`**. **React Hook Form + Yup** for the create form. API helpers live under `frontend/src/api/`.

**API surface:** `GET /bookings` (optional `?status=…`), `POST /bookings`, `PATCH /bookings/:id/status`. Root `GET /` returns a short health-style message.

---
