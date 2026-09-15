# NestJS Boilerplate

A production-ready starting point for NestJS APIs: layered module architecture, JWT auth, TypeORM + MySQL with migrations, Redis cache and BullMQ jobs, consistent API responses, and a full set of **AI coding-agent instructions** so assistants write code the way this project expects.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | NestJS 11, TypeScript 5 (`strictNullChecks`) |
| Database | MySQL via TypeORM 0.3 (`synchronize: false`, migrations) |
| Auth | Passport (local + JWT), access & refresh tokens, role guard |
| Cache / Queue | cache-manager (memory or Redis), BullMQ |
| Realtime | Socket.IO gateways (optional) |
| Security | Helmet, CORS, global rate limiting, bcrypt, request-log redaction |
| Observability | Winston daily-rotating logs, correlation IDs, `api_logs` table |
| Docs | Swagger at `/docs` (non-production) |
| Quality | ESLint + Prettier, Jest, guideline validator, GitHub Actions CI |

## Getting started

### Prerequisites
- Node.js >= 20 and npm >= 10
- MySQL 8 (and Redis if you enable the Redis cache or jobs) — or use Docker Compose

### Setup

```bash
npm install
cp .env.example .env          # then edit secrets: DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET ...
npm run migration:run          # creates users + api_logs
npm run seed                   # creates the super admin from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/api/v1/health`
- Swagger: `http://localhost:3000/docs`

### Docker

```bash
cp .env.example .env
docker compose up -d --build   # app + MySQL 8.4 + Redis 7
docker compose exec app npx typeorm migration:run -d dist/config/typeorm.config.js
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start in watch mode |
| `npm run start:debug` | Start with debugger in watch mode |
| `npm run build` / `npm run start:prod` | Compile to `dist/` and run it |
| `npm run repl` | Nest REPL with the app context |
| `npm run lint` | ESLint + Prettier with auto-fix |
| `npm run lint:check` | ESLint without changes (CI) |
| `npm run lint:guidelines` | Architectural rule checks (`validate-guidelines.js`) |
| `npm test` / `npm run test:watch` / `npm run test:cov` | Unit tests |
| `npm run test:e2e` | E2E tests (requires a database) |
| `npm run migration:create -- src/database/migrations/Name` | Empty migration |
| `npm run migration:generate -- src/database/migrations/Name` | Migration from entity changes |
| `npm run migration:run` / `npm run migration:revert` | Apply / roll back migrations |
| `npm run seed` | Run database seeders |

## Environment

All variables are documented in [`.env.example`](./.env.example) and read through `registerAs()` factories in `src/config`:

| File | Namespace | Key variables |
|------|-----------|---------------|
| `app.config.ts` | `app` | `NODE_ENV`, `PORT`, `API_PREFIX`, `CORS_ORIGIN`, `TZ`, `THROTTLE_TTL`, `THROTTLE_LIMIT` |
| `database.config.ts` | `database` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `DB_LOGGING`, `DB_TIMEZONE` |
| `jwt.config.ts` | `jwt` | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN` |
| `redis.config.ts` / `queue.config.ts` | `redis` / `queue` | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`, `REDIS_PREFIX` |
| `cache.config.ts` | `cache` | `CACHE_DRIVER` (`memory`\|`redis`), `CACHE_TTL` |
| `mail.config.ts` | `mail` | `MAIL_HOST`, `MAIL_PORT`, `MAIL_SECURE`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_*` |

Never commit `.env` files or credential files; `.gitignore` already excludes them.

## Folder structure

```
.
├── .ai/                        # AI agent guidelines, context and skills (see below)
├── .github/workflows/ci.yml    # Lint, guideline checks, build, unit tests
├── .kiro/hooks/                # Kiro pre-write guideline hook
├── docs/BASE_REPOSITORY.md     # BaseRepository helper reference
├── skills/                     # Installed agent skills (skills-lock.json)
├── src/
│   ├── main.ts                 # Bootstrap: security, prefix/versioning, pipes, filters, Swagger
│   ├── app.module.ts           # Config, throttling, schedule, core + feature modules
│   ├── app.controller.ts       # GET /health
│   ├── repl.ts
│   ├── common/
│   │   ├── constants/          # PAGINATION_LIMITS, SENSITIVE_FIELDS
│   │   ├── decorators/         # @Public, @Roles, @CurrentUser, @IsFutureDate
│   │   ├── dto/                # ApiResponseDto, PaginationQueryDto, PaginationMetaDto
│   │   ├── enums/              # Role, Status, OrderDirection, AppType, DeviceType
│   │   ├── filters/            # AllExceptionsFilter (global), HttpExceptionFilter
│   │   ├── guards/             # JwtAuthGuard, LocalAuthGuard, RolesGuard, ThrottlerGuard
│   │   ├── interceptors/       # TransformInterceptor, LoggingInterceptor, TimeoutInterceptor
│   │   ├── interfaces/         # JwtPayload, AuthenticatedUser, PaginatedResult
│   │   ├── middlewares/        # CorrelationIdMiddleware, LoggerMiddleware
│   │   ├── pipes/              # ValidationPipe, ParseUUIDPipe
│   │   ├── repositories/       # BaseRepository (extend this in every repository)
│   │   ├── services/           # Shared services
│   │   └── utils/              # Date, string, password, pagination, redact, JSON, token
│   ├── config/                 # registerAs() configs + TypeORM CLI data source
│   ├── core/
│   │   ├── cache/              # CacheModule (memory/Redis) + CacheService
│   │   ├── database/           # DatabaseModule, BaseEntity (uuid, timestamps, soft delete)
│   │   ├── events/             # EventEmitter
│   │   ├── logger/             # Winston LoggerService
│   │   └── queue/              # BullMQ root module, BaseProcessor
│   ├── database/
│   │   ├── factories/          # UserFactory
│   │   ├── migrations/         # TypeORM migrations
│   │   └── seeds/              # Seed runner + UserSeed
│   ├── gateways/               # BaseGateway, EventsGateway (import GatewaysModule to enable)
│   ├── jobs/                   # Email queue producer/processor (import JobsModule to enable)
│   └── modules/
│       ├── auth/               # Register, login, refresh, me, change password
│       ├── logging/            # api_logs persistence + interceptor
│       └── users/              # Reference feature module
├── test/                       # E2E tests (jest-e2e.json)
├── AGENTS.md / CLAUDE.md       # Entry points for AI coding agents
├── API_DOCUMENTATION.md        # Endpoint reference — keep updated
├── API_RESPONSE_FORMAT.md      # Response envelope and error format
├── DEVELOPER_GUIDELINES.md     # Conventions, patterns, review checklist
├── DEPLOYMENT_CHECKLIST.md
└── TESTING_GUIDE.md
```

## Module anatomy

Every feature module follows the layout of `src/modules/users`:

```
modules/<feature>/
├── __tests__/{controllers,services,dto}/   # unit tests, mirrored by layer
├── controllers/<feature>.controller.ts      # HTTP only: DTOs in, one service call out
├── dto/                                     # class-validator + Swagger decorated inputs
├── entities/<entity>.entity.ts              # extends BaseEntity, snake_case columns → camelCase
├── repositories/<entity>.repository.ts      # extends BaseRepository — ALL queries live here
├── services/<feature>.service.ts            # business logic, exceptions, logging
├── interfaces/ | constants/ | subscribers/  # optional
├── <feature>.module.ts                      # registers controllers, services, repositories
└── index.ts                                 # barrel export
```

Request flow: `ThrottlerGuard → JwtAuthGuard → RolesGuard → ValidationPipe → Controller → Service → Repository → TransformInterceptor`.

Rules of thumb:
- Other modules call your **service** (export it from the module), never your repository.
- Use `@common/*`, `@core/*`, `@modules/*` aliases instead of deep relative imports.
- Every schema change is a migration with `up()` and `down()`.

Full conventions: [DEVELOPER_GUIDELINES.md](./DEVELOPER_GUIDELINES.md).

## API responses

Controllers return plain data. `TransformInterceptor` produces `{ "success": true, "message": "Success", "data": ... }` and `AllExceptionsFilter` produces `{ "success": false, "statusCode", "timestamp", "path", "message" }`. See [API_RESPONSE_FORMAT.md](./API_RESPONSE_FORMAT.md) and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Auth at a glance

- `JwtAuthGuard` is global — every route needs `Authorization: Bearer <token>` unless decorated with `@Public()`.
- Restrict routes with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.ADMIN)`.
- `@CurrentUser()` injects `{ id, name, email, role }`.
- Refresh tokens are signed with a separate secret; suspending a user (`status != active`) invalidates both tokens on next use.

## AI agent instructions

This repository is set up so AI coding assistants follow the same rules as the team.

| Path | Purpose |
|------|---------|
| `AGENTS.md` | Summary of the rules + commands for agents that read `AGENTS.md` |
| `CLAUDE.md` | Imports `AGENTS.md` for Claude Code |
| `.ai/steering/project-guidelines.md` | **Master rules** (single source of truth) |
| `.ai/steering/CRITICAL-RULES-CHECKLIST.md` | Pre-write checklist |
| `.ai/steering/project-context.md` | Impact map + log of recent implementations (agents append after each change) |
| `.ai/steering/PRODUCT-FLOWS.md` | User journeys / API sequences |
| `.ai/steering/MISSING-GUIDANCE.md` | What the context file should grow into |
| `.ai/skills/`, `skills/` | API and E2E testing skills |
| `.kiro/hooks/` | Kiro hook that re-checks the guidelines before every file write |
| `validate-guidelines.js` | `npm run lint:guidelines` — catches queries in services, entity injection, `process.env` misuse |

Configure other tools (Cursor, Copilot, Windsurf, Cody) from the master rules:

```bash
./sync-ai-rules.sh      # macOS / Linux
sync-ai-rules.bat       # Windows
```

See [.ai/README.md](./.ai/README.md) for per-tool setup.

## Optional modules

- **Background jobs** — add `JobsModule` to `AppModule.imports` (requires Redis and SMTP settings), then inject `EmailProducer`.
- **WebSockets** — add `GatewaysModule` to `AppModule.imports`; extend `BaseGateway` for new gateways.
- **Redis cache** — set `CACHE_DRIVER=redis`.

## License

MIT
