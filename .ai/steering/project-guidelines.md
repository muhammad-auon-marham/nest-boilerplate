---
inclusion: always
priority: critical
---

# Project Coding Guidelines

## Architecture & layering
* Always write database queries inside a repository and never write them directly inside the service layer.
* Always create a dedicated repository class for every entity and avoid injecting an entity directly as a repository (`@InjectRepository(Entity)` is not allowed in modules).
* Always extend repositories from the `/src/common/repositories/base.repository.ts` file.
* Always create a proper service, controller, repository, DTO, and entity for every module following the folder structure: `controllers/`, `dto/`, `entities/`, `repositories/`, and `services/` (see `src/modules/users` for the reference implementation).
* Register all services, controllers, and repositories within their respective `.module.ts` file.
* Organize modules with multiple services, controllers, or repositories into proper sub-folders such as `{module}/services/`.
* Keep controllers thin by only parsing request data and calling exactly one service method; they must never contain business logic.
* Cross-module data access must go through the target module's Service layer; direct calls to another module's Repository are strictly prohibited.
* Prioritize code reuse and utilize existing utilities and core components (`src/common`, `src/core`) to avoid boilerplate code.

## Imports, types & style
* Use path aliases like `@modules/`, `@common/`, `@core/`, `@config/` for imports; never use relative paths that go back more than one directory level.
* Move logic for encoding, decoding, formatting, and date/time transformations into dedicated `src/common/utils` files rather than placing it in services or controllers.
* Don't use magic values anywhere. Always use proper enums or constants.
* Use a TypeScript interface if more than two variables are passed into an internal function.
* Maintain strict TypeScript mode, including `strictNullChecks`, and provide explicit type annotations for all function parameters and return types.
* Limit code to a maximum of one white line before or after the start and end of a function.
* Leave one line before writing a new function.
* Remove all `console.log` statements, dead code, and commented-out code blocks before committing.

## API
* Create a corresponding DTO using `class-validator` for every endpoint that accepts a request body, query string, or route parameter.
* Return plain data from controllers — `TransformInterceptor` wraps it in the standard response envelope (see `API_RESPONSE_FORMAT.md`). Throw Nest HTTP exceptions for errors.
* Every route is protected by the global `JwtAuthGuard`; explicitly mark public endpoints with the `@Public()` decorator and restrict privileged endpoints with `@Roles()` + `RolesGuard`.
* Document every endpoint with Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`).
* Update the `API_DOCUMENTATION.md` file immediately after creating or modifying an API.

## Configuration, security & logging
* Access environment variables only through the `ConfigService`; never read `process.env` directly in services or controllers. Add new variables to a `src/config/*.config.ts` file and to `.env.example`.
* Never commit secrets, API keys, JWT secrets, service-account files, or credentials to version control; use placeholder values in `.env.example` instead.
* Never log or persist passwords, tokens, or other secrets. Add new sensitive request fields to `SENSITIVE_FIELDS` in `src/common/constants`.
* Use the Winston-based `LoggerService` at the service level only; do not log in controllers.

## Database
* Disable database `synchronize` in all environments and implement every schema change via a TypeORM migration in `src/database/migrations` with functional `up()` and `down()` methods.
* Optimize database queries to avoid N+1 patterns and use `select` to return only necessary fields.
* Never ever run a query inside a loop.
* Parameterize all database queries to prevent SQL injection; string-interpolated SQL is strictly prohibited.
* Always use the `DeleteDateColumn` type for the `deletedAt` column in entities (extend `src/core/database/base.entity.ts`).

## Testing
* Always write unit tests for each function/module you develop.
* Always create a `__tests__` folder inside the module for the unit tests, with proper sub-folders (`controllers`, `services`, `dto`, etc.).

## Workflow & documentation
* Format all commit messages according to the Conventional Commits specification: `<type>(<scope>): <short description>`.
* Ensure every commit is atomic, containing exactly one logical change.
* Log any deliberate shortcuts or suboptimal implementations as GitHub Issues with the `tech-debt` label.
* Do not create separate `.md` files to explain features unless explicitly demanded.
* After writing any piece of code, developing a feature, or fixing a bug, always put its context in brief (min 2-3 lines, max 8-9 lines) in `.ai/steering/project-context.md`.
