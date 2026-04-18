# Hospitality platform — booking module

Mini full-stack workspace for a hospitality booking feature: **NestJS + MongoDB** API and a **React (Vite) + TypeScript** frontend.

## Repository layout

| Path        | Description                                      |
| ----------- | ------------------------------------------------ |
| `backend/`  | NestJS REST API, Mongoose models, validation     |
| `frontend/` | Vite + React + Tailwind (UI shell / dashboard) |

## Prerequisites

- **Node.js** 20.19+ or 22.12+ (recommended; Vite and tooling warn on older 22.x patch levels)
- **MongoDB** reachable locally (`mongodb://...`) or **MongoDB Atlas**
- **npm** (or use your preferred package manager consistently per app)

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env: set MONGODB_URI (and PORT if needed)
npm install
npm run seed    # optional: loads sample bookings (clears `bookings` collection first)
npm run start:dev
```

Default API base URL: `http://localhost:3000` (or your `PORT`).

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Ensure VITE_API_URL matches the backend URL (e.g. http://localhost:3000)
npm install
npm run dev
```

Default UI: `http://localhost:5173`.

## Environment variables

| App      | File        | Variables (examples) |
| -------- | ----------- | -------------------- |
| Backend  | `backend/.env` | `MONGODB_URI`, `PORT`, `NODE_ENV` |
| Frontend | `frontend/.env` | `VITE_API_URL` (backend origin, no trailing slash on paths) |

Never commit real `.env` files; use `.env.example` as a template.

## Backend API (bookings)

| Method | Path | Description |
| ------ | ---- | ----------- |
| `GET`  | `/bookings` | List bookings; optional query `?status=pending` (etc.) |
| `POST` | `/bookings` | Create booking (starts as `pending`) |
| `PATCH`| `/bookings/:id/status` | Body: `{ "status": "confirmed" }` — transitions are validated |

Root `GET /` returns a short welcome string.

Validation highlights:

- Required fields on create; dates validated; check-out must be after check-in (DTO + service).
- Status transitions enforced (e.g. `pending` → `confirmed` | `cancelled`; terminal states block further changes).
- Patching to the **same** status as current is a no-op (success).

## Sample data

From `backend/`:

```bash
npm run seed
```

Inserts several rows across all statuses. **This deletes existing documents** in the `bookings` collection first. See `backend/README.md` for details.

## Architecture (short)

- **Backend:** Controllers expose HTTP; **services** hold business rules (dates, status transitions); **Mongoose schemas** define persistence. DTOs + `ValidationPipe` handle request validation. Config and Mongo connection use `@nestjs/config` with Joi env validation.
- **Frontend:** Vite SPA; `VITE_API_URL` points at the API for `fetch` / React Query usage as you build the dashboard.

## Assumptions

- **Currency:** `totalAmount` is a non-negative number; display currency (e.g. USD) is a UI concern unless you add a currency field later.
- **Dates:** Stored as UTC `Date` in MongoDB; clarify timezone in the UI when formatting.
- **CORS:** Backend enables broad CORS for local development; restrict origins in production.

## Scripts reference

| Location   | Command        | Purpose        |
| ---------- | -------------- | -------------- |
| `backend`  | `npm run build` | Compile        |
| `backend`  | `npm run start:dev` | Dev server |
| `backend`  | `npm run seed` | Sample data    |
| `frontend` | `npm run build` | Production build |
| `frontend` | `npm run dev`  | Dev server     |

## License

Private / assessment use unless you add a public license.
