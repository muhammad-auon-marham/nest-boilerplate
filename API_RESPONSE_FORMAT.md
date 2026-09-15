# API Response Format

This document describes the consistent JSON response format used throughout the application.

## Success Response Format

All successful API responses follow this structure:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    // Your actual response data here
  }
}
```

If a service returns an object with a `message` key, that value becomes the envelope `message` and is removed from `data`.

### Examples

#### 1. Auth - Register
**Endpoint:** `POST /api/v1/auth/register` → `201`

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

#### 2. Auth - Login
**Endpoint:** `POST /api/v1/auth/login` → `200`

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Response:** same shape as Register.

#### 3. Auth - Refresh Token
**Endpoint:** `POST /api/v1/auth/refresh` → `200`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** same shape as Register (a new token pair).

#### 4. Auth - Get Profile
**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "id": "4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "status": "active",
    "lastLoginAt": "2026-01-01T12:00:00.000Z",
    "createdAt": "2026-01-01T11:59:00.000Z",
    "updatedAt": "2026-01-01T12:00:00.000Z"
  }
}
```

#### 5. Auth - Change Password
**Endpoint:** `PATCH /api/v1/auth/change-password`

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

#### 6. Users - List Users (paginated)
**Endpoint:** `GET /api/v1/users?page=1&limit=20` (admin)

**Response:**
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "data": [
      {
        "id": "4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "role": "user",
        "status": "active"
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "lastPage": 3
    }
  }
}
```

## Error Response Format

All error responses are produced by `AllExceptionsFilter` and follow this structure:

```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/auth/login",
  "message": "Invalid credentials"
}
```

### Error Examples

#### 1. Validation Error
`message` is an array of every failed constraint.
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/auth/register",
  "message": [
    "email must be an email",
    "Password must be at least 8 characters long and contain an uppercase letter, a lowercase letter, a number, and a special character"
  ]
}
```

#### 2. Unauthorized Error
```json
{
  "success": false,
  "statusCode": 401,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/auth/me",
  "message": "Unauthorized"
}
```

#### 3. Forbidden Error (missing role)
```json
{
  "success": false,
  "statusCode": 403,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/users",
  "message": "Forbidden resource"
}
```

#### 4. Not Found Error
```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/users/4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21",
  "message": "User with ID 4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21 not found"
}
```

#### 5. Conflict Error
```json
{
  "success": false,
  "statusCode": 409,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/auth/register",
  "message": "A user with this email already exists"
}
```

## Implementation Details

The consistent response format is achieved through:

1. **TransformInterceptor** (`src/common/interceptors/transform.interceptor.ts`)
   - Automatically wraps all successful responses in the `ApiResponseDto` format
   - Applied globally in `main.ts`

2. **AllExceptionsFilter** (`src/common/filters/all-exceptions.filter.ts`)
   - Catches every exception (HTTP and unexpected) and formats it consistently
   - Logs 5xx errors with stack traces, 4xx as warnings
   - Applied globally in `main.ts`

3. **HttpExceptionFilter** (`src/common/filters/http-exception.filter.ts`)
   - Alternative filter that also returns `method` and `errors`; not registered by default

4. **ApiResponseDto** (`src/common/dto/api-response.dto.ts`)
   - Defines the standard response structure
   - Provides static helper methods for creating responses

## Best Practices

1. **Controllers should return data directly** - The interceptor will wrap it automatically
2. **Throw exceptions for errors** - The filter will format them consistently
3. **Use descriptive error messages** - They will be shown to the client
4. **Include metadata for lists** - Use `PaginationUtil.buildResult()` for `data` + `meta`
5. **Never return secrets** - Hidden columns (`select: false`) and response DTOs keep passwords out of responses
