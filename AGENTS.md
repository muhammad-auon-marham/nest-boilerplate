# AGENTS.md

Instructions for AI coding agents working in this repository. Humans: see `README.md` and `DEVELOPER_GUIDELINES.md`.

## Source of truth

Read these before writing code — they override anything in this summary:

1. `.ai/steering/project-guidelines.md` — master coding rules
2. `.ai/steering/CRITICAL-RULES-CHECKLIST.md` — pre-write checklist
3. `.ai/steering/project-context.md` — impact map ("if I touch X, what breaks?")
4. `.ai/steering/PRODUCT-FLOWS.md` — user journeys and API sequences
5. `DEVELOPER_GUIDELINES.md`, `API_RESPONSE_FORMAT.md`, `TESTING_GUIDE.md`
6. Skills: `.ai/skills/api-testing-patterns`, `.ai/skills/e2e-testing-patterns`

## Stack

NestJS 11 · TypeScript (strict null checks) · TypeORM + MySQL · Redis (cache, BullMQ) · Passport JWT · Jest · Swagger at `/docs`.

## Commands

```bash
npm run start:dev        # watch mode
npm run build            # must pass
npm run lint:check       # 0 errors required (npm run lint auto-fixes)
npm test                 # unit tests must pass
npm run lint:guidelines  # architectural rule checks
npm run migration:run    # apply migrations
```

## Key rules (summary)

- **Layering:** controller (thin, one service call) → service (business logic) → repository (all queries). Reference module: `src/modules/users`.
- **Repositories** extend `src/common/repositories/base.repository.ts`. Never `@InjectRepository(Entity)` in modules. Never call another module's repository — use its service.
- **Module layout:** `controllers/ dto/ entities/ repositories/ services/ __tests__/{controllers,services,dto}` and register everything in `*.module.ts`.
- **Imports:** `@common/*`, `@core/*`, `@modules/*`, `@config/*`, `@jobs/*`, `@gateways/*` — no `../../` chains.
- **Input:** a `class-validator` DTO for every body, query and param. More than two internal params → interface.
- **No magic values:** enums in `src/common/enums`, constants in `src/common/constants`.
- **Responses:** return plain data; `TransformInterceptor` wraps `{ success, message, data }`. Throw Nest HTTP exceptions for errors.
- **Auth:** the JWT guard is global. Mark public routes with `@Public()`; restrict with `@Roles()`.
- **Config & secrets:** only via `ConfigService`; new env vars go in `src/config/*.config.ts` and `.env.example`. Never commit credentials. Never log passwords/tokens (extend `SENSITIVE_FIELDS`).
- **Database:** `synchronize` is off. Every schema change is a migration in `src/database/migrations` with `up()` and `down()`. No queries in loops; select only needed columns; parameterize SQL.
- **Utils:** formatting/encoding/date logic lives in `src/common/utils`.
- **Logging:** `LoggerService` in services only; no `console.log`.
- **Tests:** write unit tests for every new function/module.
- **Docs:** update `API_DOCUMENTATION.md` for API changes and append a 2–9 line entry to `.ai/steering/project-context.md` → *Recent Implementations*. Don't create other feature `.md` files unless asked.
- **Commits:** Conventional Commits, one logical change each.
