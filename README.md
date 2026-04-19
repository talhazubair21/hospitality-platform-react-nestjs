# Hospitality platform — booking module

Full-stack **hospitality bookings** workspace: a **NestJS** REST API backed by **MongoDB**, and a **React (Vite) + TypeScript** SPA with Tailwind CSS. The UI lists bookings, filters by status, creates new bookings, and updates status with validation on both client and server.

---

## Repository layout

| Path        | Description |
| ----------- | ----------- |
| `backend/`  | NestJS REST API, Mongoose models, DTO validation, booking business rules |
| `frontend/` | Vite + React 19, TanStack Query, Axios, React Hook Form + Yup, Tailwind v4 |

---

## Prerequisites

- **Node.js** 20.19+ or **22.12+** (Vite and some tooling warn on older Node 22 patch levels)
- **MongoDB** running locally (`mongodb://...`) or **MongoDB Atlas**
- **npm** (this README uses `npm`; the backend also lists Yarn as its package manager—use one consistently per package)

---

## Setup instructions

### 1. Clone and install

From the repository root, install dependencies for each app:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Backend environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

| Variable       | Purpose |
| -------------- | ------- |
| `MONGODB_URI`  | Mongo connection string (required), e.g. `mongodb://localhost:27017/booking_module` |
| `PORT`         | HTTP port (default `3000`) |
| `NODE_ENV`     | e.g. `development` |

### 3. Start MongoDB

Ensure the database in `MONGODB_URI` is reachable before starting the API.

### 4. (Optional) Load sample data

From `backend/`:

```bash
npm run seed
```

This **clears** the `bookings` collection and inserts several documents covering all booking statuses. See [Sample data](#sample-data).

### 5. Run the API

```bash
cd backend
npm run start:dev
```

The API listens on `http://localhost:3000` unless you changed `PORT`.

### 6. Frontend environment

```bash
cd frontend
cp .env.example .env
```

Set `VITE_API_URL` to the **origin** of the API (no trailing slash on the path), e.g.:

```env
VITE_API_URL=http://localhost:3000
```

Restart the Vite dev server after changing any `VITE_*` variable.

### 7. Run the UI

```bash
cd frontend
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

### 8. Production builds

```bash
cd backend && npm run build && npm run start:prod
cd frontend && npm run build && npm run preview   # or serve dist/ with any static host
```

---

## Environment variables

| App      | File              | Variables |
| -------- | ----------------- | --------- |
| Backend  | `backend/.env`    | `MONGODB_URI` (required), `PORT`, `NODE_ENV` |
| Frontend | `frontend/.env`   | `VITE_API_URL` — backend base URL used by Axios (defaults in code to `http://localhost:3000` if unset) |

Do not commit real secrets; keep `.env` local and use `.env.example` as the template.

---

## Backend API (bookings)

| Method  | Path | Description |
| ------- | ---- | ----------- |
| `GET`   | `/bookings` | List bookings, sorted by **newest first** (`createdAt` descending). Optional query: `?status=pending` (and other enum values). |
| `POST`  | `/bookings` | Create a booking; server sets status to `pending` and timestamps. |
| `PATCH` | `/bookings/:id/status` | Body: `{ "status": "<BookingStatus>" }`. Transitions are validated server-side. |

The root route returns a short welcome string from `AppController`.

### Status transitions (server-enforced)

Allowed moves are defined in `bookings.service.ts` (non-terminal states can move to multiple targets; `checked_out` and `cancelled` are terminal):

- From **pending**: confirmed, checked_in, checked_out, cancelled  
- From **confirmed**: checked_in, checked_out, cancelled  
- From **checked_in**: checked_out, cancelled  

Patching to the **same** status as the current one succeeds as a no-op.

---

## Sample data

### Database seed (recommended)

From `backend/`:

```bash
npm run seed
```

- **Requires** `MONGODB_URI` in `.env`.
- **Deletes all documents** in the `bookings` collection, then inserts sample rows (names such as Alex Rivera, Jordan Lee, etc.) with varied **check-in / check-out** dates and one row per **status** (`pending`, `confirmed`, `checked_in`, `checked_out`, `cancelled`).
- Timestamps `createdAt` / `updatedAt` are set on insert.

Implementation: `backend/scripts/seed-bookings.cjs`.

### Frontend mock file (optional)

`frontend/src/data/mockBookings.ts` holds static **sample-shaped** data for local experimentation. The production list screen uses the **live API** via React Query; the mock file is not required for normal runs.

---

## Assumptions

- **Authentication:** None in this module; the API is open for local development. Production would add auth and tighten CORS.
- **Currency:** `totalAmount` is a non-negative number; the UI labels it as USD for display only—there is no multi-currency model.
- **Time zones:** Dates are stored as UTC `Date` values in MongoDB; the UI formats them for display without a separate timezone field per booking.
- **Single property system:** Bookings are flat records (guest, property name string, dates, status, amount)—no separate Property or User entities in this slice.
- **CORS:** The Nest app enables broad CORS for local dev; restrict allowed origins in production.
- **Idempotency / concurrency:** No special handling for concurrent edits beyond MongoDB’s last-write wins on updates.
- **Node version:** Tooling may warn on Node 22.0.0; use a supported LTS or the versions noted in [Prerequisites](#prerequisites).

---

## Architecture decisions (brief)

### Backend

- **NestJS modules** separate wiring (`BookingsModule`) from **controllers** (HTTP) and **services** (rules: status transitions, validation of moves).
- **Mongoose** persists bookings; the schema uses **`timestamps: true`** plus explicit `createdAt` / `updatedAt` fields for clarity. List queries sort by **`createdAt: -1`** so the newest bookings appear first.
- **DTOs + `ValidationPipe`** (with `class-transformer` / `class-validator`) validate create payloads; env vars are validated with **Joi** at startup.
- **Status transitions** are centralized in one map in the service so API behavior stays consistent and easy to audit.

### Frontend

- **Vite** for fast dev and build; **React Router** for `/bookings` and `/bookings/new`.
- **TanStack Query** manages server state (loading, errors, cache invalidation after mutations). **Axios** is the HTTP client with a shared instance (`apiBaseUrl` / `VITE_API_URL`).
- **React Hook Form + Yup** validate the create-booking form on the client; types are normalized when reading the API (e.g. booking status strings).
- **UI feedback:** React Hot Toast for success/error; list and mutation errors distinguish **network unreachable** vs **HTTP** responses with clearer copy and styling.
- **Separation:** API functions and query/mutation hooks live under `src/api/`; presentational table and pages stay focused on layout and user actions.

This keeps validation on both tiers, a single source of truth for ordering and transitions on the server, and a predictable data layer on the client.

---

## Testing

Automated tests are included so you can check booking logic and client helpers **before** starting MongoDB or the full app. The backend uses **Jest** with a mocked Mongoose model; the frontend uses **Vitest** with **Node** as the test environment (no browser required for the current suite).

### Backend (Jest)

| Area | What is tested |
| ---- | -------------- |
| `BookingsService` | `findAll` status filter vs “all”; `create` trims names and sets `pending`; `updateStatus` — invalid id, missing booking, no-op same status, allowed transition, blocked transition from terminal states |
| `CreateBookingDto` | Valid payloads; missing guest name; negative `totalAmount`; check-out on/before check-in |

From the `backend/` directory:

```bash
npm test              # run all tests once
npm run test:watch    # re-run on file changes
npm run test:cov      # run with coverage report (output under `coverage/`)
npm run test:ci       # single run, CI-friendly (`--ci --runInBand`)
```

**Note:** Unit tests do **not** require `MONGODB_URI` or a running database.

Test files live next to source as `*.spec.ts` (e.g. `bookings.service.spec.ts`, `dto/create-booking.dto.spec.ts`). Jest loads `src/test-setup.ts` so `reflect-metadata` works with decorators.

### Frontend (Vitest)

| Area | What is tested |
| ---- | -------------- |
| `createBookingSchema` | Happy path; required fields; check-out after check-in; non-negative amount |
| `booking` types | `parseBookingStatus` normalization/aliases; `bookingFromApi` date parsing |
| `errors.ts` | Network vs HTTP failures; server messages; list error panel / toast copy |

From the `frontend/` directory:

```bash
npm test              # run all tests once (`vitest run`)
npm run test:watch    # Vitest interactive watch
npm run test:cov      # run with V8 coverage (output under `coverage/`)
```

Configuration merges `vite.config.ts` with `vitest.config.ts` so the same plugins apply in tests. Test files use the `*.test.ts` suffix under `src/`.

---

## Scripts reference

| Location   | Command | Purpose |
| ---------- | ------- | ------- |
| `backend`  | `npm run build` | Compile Nest app |
| `backend`  | `npm run start:dev` | Dev API with watch |
| `backend`  | `npm run seed` | Load sample bookings (clears collection) |
| `backend`  | `npm test` | Run Jest unit tests (bookings service + DTO validation) |
| `backend`  | `npm run test:watch` | Jest in watch mode |
| `backend`  | `npm run test:cov` | Jest with coverage report |
| `backend`  | `npm run test:ci` | Jest once, CI-friendly (`--ci --runInBand`) |
| `frontend` | `npm run build` | Typecheck + Vite production build |
| `frontend` | `npm run dev` | Vite dev server |
| `frontend` | `npm run lint` | ESLint |
| `frontend` | `npm test` | Run Vitest (validation, types, API error helpers) |
| `frontend` | `npm run test:watch` | Vitest watch mode |
| `frontend` | `npm run test:cov` | Vitest with coverage |

---

## License

Private / assessment use unless you add a public license.
