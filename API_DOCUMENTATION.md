# API Documentation

Base URL: `http://localhost:3000/api/v1`
Interactive docs (non-production): `http://localhost:3000/docs`

All responses use the envelope described in [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md).
Unless marked **Public**, endpoints require `Authorization: Bearer <accessToken>`.

Optional client headers (stored on `api_logs`): `app-type` (`AppType` enum), `device-type` (`DeviceType` enum).

> Keep this file updated whenever an endpoint is added or changed.

---

## Health

### `GET /health` — Public
Liveness probe.

**Response `200`**
```json
{ "status": "ok", "timestamp": "2026-01-01T12:00:00.000Z" }
```

---

## Auth

### `POST /auth/register` — Public
Create an account (role `user`) and receive tokens.

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | required, max 100 |
| `email` | string | required, valid email, lowercased |
| `password` | string | min 8, upper + lower + number + special character |

**Response `201`** — `{ accessToken, refreshToken, user: { id, name, email, role } }`
**Errors** — `400` validation, `409` email already exists

### `POST /auth/login` — Public
| Field | Type | Rules |
|-------|------|-------|
| `email` | string | required |
| `password` | string | required |

**Response `200`** — `{ accessToken, refreshToken, user }`
**Errors** — `401` invalid credentials or inactive account

### `POST /auth/refresh` — Public
| Field | Type | Rules |
|-------|------|-------|
| `refreshToken` | string | required |

**Response `200`** — new `{ accessToken, refreshToken, user }`
**Errors** — `401` invalid/expired token or inactive user

### `GET /auth/me`
Returns the authenticated user (`id, name, email, role, status, lastLoginAt, createdAt, updatedAt`).

### `PATCH /auth/change-password`
| Field | Type | Rules |
|-------|------|-------|
| `currentPassword` | string | required |
| `newPassword` | string | password rules |
| `confirmPassword` | string | must equal `newPassword` |

**Response `200`** — message `Password changed successfully`
**Errors** — `400` mismatch/validation, `401` wrong current password

---

## Users

### `PATCH /users/me`
Update the authenticated user's profile.

| Field | Type | Rules |
|-------|------|-------|
| `name` | string | optional, max 100 |

### `POST /users` — Roles: `super_admin`, `admin`
Create a user. Body: `name`, `email`, `password`, optional `role` (`super_admin`/`admin`/`user`), optional `status` (`active`/`inactive`/`pending`/`suspended`).
**Errors** — `409` email already exists

### `GET /users` — Roles: `super_admin`, `admin`
Query: `page` (default 1), `limit` (default 20, max 100).
**Response `200`** — `{ data: User[], meta: { total, page, limit, lastPage } }`

### `GET /users/:id` — Roles: `super_admin`, `admin`
`id` must be a UUID. **Errors** — `400` invalid UUID, `404` not found

### `PATCH /users/:id` — Roles: `super_admin`, `admin`
Body: any of `name`, `email`, `role`, `status`. **Errors** — `404`, `409`

### `DELETE /users/:id` — Roles: `super_admin`, `admin`
Soft-deletes the user. **Response `204`**

---

## WebSocket (optional)

Enabled when `GatewaysModule` is imported in `AppModule`.

| Namespace | Client event | Server reply |
|-----------|--------------|--------------|
| `/events` | `ping` (any payload) | `pong` (same payload) |
