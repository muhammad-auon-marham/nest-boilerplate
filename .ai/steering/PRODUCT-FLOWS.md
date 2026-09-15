---
inclusion: always
priority: high
---

# Product Flows — How The System Works

> **Purpose:** Document every user journey and API sequence. When a feature affects these flows, conflicts become obvious.
>
> Use this BEFORE implementing any feature. If it changes any of these sequences, you're touching core logic.
> Section 1 documents the boilerplate; add a section per product flow using the template at the end.

---

## 1. User Authentication Flow

### **Path A: Register**

```
Client → POST /api/v1/auth/register { name, email, password }
    ↓
RegisterDto validation (email lowercased, password strength)
    ↓
UsersService.create()
    ├─ email already exists? → 409 Conflict
    └─ hash password (PasswordUtil) → INSERT users (role=user, status=active)
    ↓
AuthService.login() → UPDATE users.last_login_at
    ↓
201 { accessToken, refreshToken, user }
```

### **Path B: Login**

```
Client → POST /api/v1/auth/login { email, password }
    ↓
LocalAuthGuard → LocalStrategy → AuthService.validateUser()
    ├─ unknown email / wrong password / status != active → 401 Invalid credentials
    └─ OK → request.user = { id, name, email, role }
    ↓
AuthService.login() → 200 { accessToken, refreshToken, user }
```

### **Path C: Authenticated Request**

```
Client → Authorization: Bearer <accessToken>
    ↓
ThrottlerGuard (global) → JwtAuthGuard (global)
    ├─ @Public() route → continue (user may be null)
    └─ JwtStrategy.validate() → reload user, must be active → request.user
    ↓
RolesGuard (if @Roles on the route) → controller → service → repository
    ↓
TransformInterceptor → { success: true, message, data }
```

### **Path D: Token Refresh**

```
Client → POST /api/v1/auth/refresh { refreshToken }
    ↓
verify with JWT_REFRESH_SECRET → user still active?
    ├─ no → 401 Invalid refresh token
    └─ yes → 200 { accessToken, refreshToken, user }
```

---

## 2. `TODO` — <Flow name>

### **Happy Path: <actor> <does something>**

```
Client → <METHOD> /api/v1/<route>
    ↓
<validation / guards>
    ↓
<service steps, tables written, events emitted>
    ↓
<response>
```

### **Status Changes / State Machine**

| From | To | Triggered by | Side effects |
|------|----|--------------|--------------|
| `TODO` | `TODO` | `TODO` | `TODO` |

### **Error Scenarios & Edge Cases**

- `TODO`

---

## Database State Changes Summary

| Flow | Tables written | Notes |
|------|----------------|-------|
| Register | `users`, `api_logs` | password hashed |
| Login / Refresh | `users.last_login_at` (login only), `api_logs` | |

---

## Key Takeaways for New Feature Development

1. **Before you implement anything:** Trace which of these flows it touches.
2. **Check guards:** Is the route public, authenticated, or role-restricted?
3. **Check enums:** Changing a persisted enum value breaks existing rows and any direct DB consumers.
4. **Check events:** If you emit or change events, verify every listener still runs and handles failure.
5. **Check migrations:** Every schema change ships with a reversible migration.
