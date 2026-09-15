---
inclusion: always
priority: high
---

# Project Context — Impact Map

> **Purpose:** This file codifies tribal knowledge that senior developers carry in their heads.
> Every entry answers: **"If I touch X, what else breaks — across ALL systems?"**
> Read the relevant section before implementing any feature or fix, and append to
> **Recent Implementations** after every change (2–9 lines, see `project-guidelines.md`).
>
> This file starts as a template for the boilerplate. Replace the `TODO` rows as your product grows.

---

## System Inventory

Any change to a shared concept (users, auth, a status enum, a table) must be evaluated against ALL of these systems — not just this API.

| System | Role | Notes |
|--------|------|-------|
| **NestJS API** (this repo) | Core backend | `src/` — see Module Inventory |
| **MySQL** | Primary datastore (TypeORM) | `synchronize: false`; schema changes only via `src/database/migrations` |
| **Redis** | Cache (`CACHE_DRIVER=redis`) and BullMQ job queues | Optional locally — cache falls back to memory |
| **SMTP server** | Outbound email via `EmailProcessor` | Only when `JobsModule` is imported |
| `TODO` Web / mobile clients | API consumers | Send `app-type` / `device-type` headers (see `AppType`, `DeviceType` enums) |
| `TODO` Analytics / BI | Reads DB directly? | If yes: renaming columns or enum values silently breaks dashboards |

---

## Module Inventory (Complete)

| Module / Area | Purpose | Key Entities / Providers |
|---------------|---------|--------------------------|
| **auth** (`src/modules/auth`) | Register, login (local strategy), JWT access/refresh tokens, change password | `AuthService`, `JwtStrategy`, `LocalStrategy`, global `JwtAuthGuard` |
| **users** (`src/modules/users`) | User CRUD (admin), own profile; reference implementation of the module layout | `User`, `UserRepository`, `UsersService`, `UserSubscriber` |
| **logging** (`src/modules/logging`) | Persists every request to `api_logs` (payload redacted) | `ApiLog`, `ApiLogService`, `ApiLoggingInterceptor` |
| **core** (`src/core`) | Database, cache, queue, logger, events infrastructure | `DatabaseModule`, `CacheService`, `QueueModule`, `LoggerService`, `EventsModule` |
| **common** (`src/common`) | Shared decorators, DTOs, enums, filters, guards, interceptors, pipes, utils, `BaseRepository` | `TransformInterceptor`, `AllExceptionsFilter`, `RolesGuard`, `ThrottlerGuard` |
| **jobs** (`src/jobs`) | BullMQ producers/processors — **not imported by default** | `EmailProducer`, `EmailProcessor` |
| **gateways** (`src/gateways`) | Socket.IO gateways — **not imported by default** | `BaseGateway`, `EventsGateway` |

---

## Domain Concept Maps

### 1. Authentication & Tokens

#### Flow
- `POST /auth/register` → `UsersService.create()` (hashes password) → tokens issued.
- `POST /auth/login` → `LocalAuthGuard` → `AuthService.validateUser()` (active users only) → tokens issued, `last_login_at` updated.
- Access token signed with `JWT_SECRET`; refresh token signed with `JWT_REFRESH_SECRET`. Payload: `{ sub, email, role }`.
- `JwtStrategy.validate()` re-loads the user on **every request** and rejects inactive users.

#### If You Touch Auth
- Changing the JWT payload shape → update `JwtPayload`, `AuthenticatedUser`, `@CurrentUser()` consumers and all clients.
- Rotating `JWT_SECRET` / `JWT_REFRESH_SECRET` → logs out every user.
- Adding a public route → it must carry `@Public()`; the guard is global (`APP_GUARD` in `AuthModule`).
- Adding sensitive request fields → add them to `SENSITIVE_FIELDS` or they will be stored in `api_logs`.

#### Non-Obvious Rules
- Refresh tokens are stateless; there is no revocation list. Suspending a user (`status != active`) is the kill switch.
- Login returns 401 for unknown email, wrong password and inactive account alike — do not leak which one.

### 2. Users

#### If You Touch Users
- `password` is `select: false`; only `findByEmailWithPassword` / `findByIdWithPassword` load it. Never return those entities to clients.
- `email` is unique (`UQ_users_email`) and normalised to lowercase in DTOs.
- Deletes are soft (`deleted_at`). Unique email still applies to soft-deleted rows.
- `Role` / `Status` are MySQL enums: adding a value requires a migration.

### 3. Request Logging

#### If You Touch Logging
- `ApiLoggingInterceptor` writes one `api_logs` row per request (fire-and-forget). High-traffic endpoints → consider sampling or moving to a queue.
- The table grows unbounded — plan retention (`TODO`).

### 4. `TODO` — Your next domain

Copy this structure per domain: **Flow**, **If You Touch X**, **Non-Obvious Rules**, **Shared Tables**, **Events Map**.

---

## Cross-Cutting Constraints

- **Response envelope** — clients rely on `{ success, message, data }` (see `API_RESPONSE_FORMAT.md`). Never wrap manually.
- **Timezone** — the process runs in `TZ` (default `UTC`); DB connection timezone is `DB_TIMEZONE` (default `Z`). Keep them aligned.
- **Rate limiting** — global `ThrottlerGuard` (`THROTTLE_TTL`, `THROTTLE_LIMIT`). Behind a proxy, configure Express `trust proxy` so client IPs are correct.
- **Events** — `EventEmitter2` listeners run in-process and can fail silently; emit after the transaction commits.

---

## Recent Implementations

<!-- Append newest entries at the bottom using this shape:

### <Feature name> (YYYY-MM-DD)

**Context:** Why the change was needed.

**Changes Made:**
1. ...

**Impact:** Tables, modules, clients or migrations affected.
-->

### Boilerplate baseline (initial)

**Context:** Generic NestJS starter with auth, users and request logging as the reference modules.

**Changes Made:**
1. Migration `CreateUsersAndApiLogs` creates `users` and `api_logs`.
2. Global guards: `JwtAuthGuard` (auth) and `ThrottlerGuard` (rate limiting).

**Impact:** Run `npm run migration:run` before first start; seed an admin with `npm run seed`.
