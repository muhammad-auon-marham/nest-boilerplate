# Developer Guidelines

> **Framework:** NestJS v11 with TypeScript
>
> Examples use `users` (a real module in this repo) and `products` (a **hypothetical** module used only to illustrate patterns).

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Naming Conventions](#4-naming-conventions)
5. [File Naming Conventions](#5-file-naming-conventions)
6. [Coding Conventions](#6-coding-conventions)
7. [Architecture Patterns](#7-architecture-patterns)
8. [Database Conventions](#8-database-conventions)
9. [API Development Guidelines](#9-api-development-guidelines)
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Error Handling](#11-error-handling)
12. [Testing Guidelines](#12-testing-guidelines)
13. [What TO DO](#13-what-to-do-)
14. [What NOT TO DO](#14-what-not-to-do-)
15. [Code Review Checklist](#15-code-review-checklist)
16. [Common Pitfalls](#16-common-pitfalls)

---

## 1. Project Overview

A production-ready NestJS API boilerplate built with TypeScript and MySQL. It ships the cross-cutting infrastructure every API needs so feature work can start immediately.

### Key Features
- JWT authentication (access + refresh tokens) with a global guard and role-based access
- Users module as the reference implementation of the module layout
- Consistent response envelope and error format
- Request logging to the database with sensitive-field redaction
- Redis caching (memory fallback) and BullMQ background jobs
- WebSocket gateway scaffold (Socket.IO)
- Swagger documentation, rate limiting, Helmet, compression

---

## 2. Technology Stack

### Core Technologies
- **Runtime:** Node.js >= 20.0.0
- **Package Manager:** npm >= 10.0.0
- **Framework:** NestJS v11
- **Language:** TypeScript v5
- **Database:** MySQL (via TypeORM v0.3)
- **Cache:** Redis (via cache-manager) or in-memory
- **Queue:** BullMQ (Redis)
- **WebSockets:** Socket.IO

### Key Libraries
- **Validation:** class-validator, class-transformer
- **Authentication:** @nestjs/jwt, @nestjs/passport, passport-jwt, passport-local
- **Security:** helmet, bcryptjs, @nestjs/throttler
- **Date Handling:** dayjs
- **Logging:** winston + winston-daily-rotate-file
- **Email:** nodemailer (via the email job processor)

---

## 3. Project Structure

```
src/
├── common/                    # Shared utilities and components
│   ├── constants/            # Application constants
│   ├── decorators/           # Custom decorators (@Public, @Roles, @CurrentUser)
│   ├── dto/                  # Common DTOs (ApiResponseDto, PaginationQueryDto)
│   ├── enums/                # Shared enums
│   ├── filters/              # Exception filters
│   ├── guards/               # Auth guards (JwtAuthGuard, RolesGuard, ThrottlerGuard)
│   ├── interceptors/         # Response / logging / timeout interceptors
│   ├── interfaces/           # TypeScript interfaces
│   ├── middlewares/          # Custom middlewares
│   ├── pipes/                # Validation pipes
│   ├── repositories/         # BaseRepository
│   ├── services/             # Shared services
│   └── utils/                # Utility functions
├── config/                   # registerAs() configuration + TypeORM CLI data source
├── core/                     # Core infrastructure
│   ├── cache/                # Cache service
│   ├── database/             # Database module, BaseEntity
│   ├── events/               # Event emitter
│   ├── logger/               # Winston logging service
│   └── queue/                # BullMQ root config, BaseProcessor
├── database/                 # Database-related files
│   ├── factories/            # Data factories for seeding/tests
│   ├── migrations/           # TypeORM migrations
│   └── seeds/                # Database seeders
├── gateways/                 # WebSocket gateways
├── jobs/                     # Background jobs
│   ├── processors/           # Job processors
│   └── producers/            # Job producers
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   ├── logging/              # API request logging
│   ├── users/                # Users module (reference implementation)
│   └── ...                   # Your feature modules
└── main.ts                   # Application entry point
```

### Module Structure (Example: `modules/users/`)
```
users/
├── __tests__/                # Unit tests, mirrored by layer
│   ├── controllers/
│   ├── dto/
│   └── services/
├── controllers/              # HTTP controllers
│   └── users.controller.ts
├── dto/                      # Data Transfer Objects
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── index.ts
├── entities/                 # TypeORM entities
│   └── user.entity.ts
├── repositories/             # Custom repositories (all queries live here)
│   └── user.repository.ts
├── services/                 # Business logic
│   └── users.service.ts
├── subscribers/              # TypeORM entity subscribers (optional)
├── users.module.ts           # Module definition
└── index.ts                  # Barrel export
```

---

## 4. Naming Conventions

### 4.1 Variables and Functions

#### Variables
- **camelCase** for variables and function parameters
- Use descriptive names that convey purpose
- Avoid single-letter variables except for loops

```typescript
// ✅ GOOD
const userId = '4f1c2b8e-...';
const activeProducts = [];
const isUserAuthenticated = true;
const normalizedEmail = email.trim().toLowerCase();

// ❌ BAD
const uid = '4f1c2b8e-...';
const ap = [];
const auth = true;
const ne = email.trim().toLowerCase();
```

#### Functions
- **camelCase** for function names
- Use verb-noun pattern for clarity

```typescript
// ✅ GOOD
async function findProductById(id: string) { }
function calculateOrderTotal(subtotal: number, discount: number) { }
async function sendWelcomeEmail(email: string) { }

// ❌ BAD
async function product(id: string) { }
function total(subtotal: number, discount: number) { }
async function email(email: string) { }
```

### 4.2 Classes and Interfaces

#### Classes
- **PascalCase** for class names
- Suffix with type indicator (Service, Controller, Repository, etc.)

```typescript
// ✅ GOOD
export class ProductsService { }
export class AuthController { }
export class Product { }
export class ProductRepository { }

// ❌ BAD
export class productsService { }
export class auth_controller { }
export class product_entity { }
```

#### Interfaces
- **PascalCase** for interface names
- No `I` prefix

```typescript
// ✅ GOOD
export interface JwtPayload { }
export interface ProductSearchParams { }
export interface AuthenticatedUser { }

// ❌ BAD
export interface IJwtPayload { }  // Unnecessary prefix
export interface product_search { }
```

#### DTOs (Data Transfer Objects)
- **PascalCase** with `Dto` suffix
- Use descriptive action-based names

```typescript
// ✅ GOOD
export class CreateProductDto { }
export class UpdateUserDto { }
export class GetProductsDto { }
export class LoginDto { }

// ❌ BAD
export class ProductDto { }  // Too generic
export class ProductUpdateDTO { }  // Wrong casing
export class getProducts { }  // Wrong casing
```

#### Entities
- **PascalCase** without suffix
- Match database table concept

```typescript
// ✅ GOOD
@Entity('products')
export class Product { }

@Entity('order_items')
export class OrderItem { }

// ❌ BAD
@Entity('products')
export class ProductEntity { }  // Redundant suffix
```

### 4.3 Constants and Enums

#### Constants
- **UPPER_SNAKE_CASE** for constants
- Group related constants in objects

```typescript
// ✅ GOOD
export const IS_PUBLIC_KEY = 'isPublic';
export const MAX_RETRY_ATTEMPTS = 3;

export const PAGINATION_LIMITS = {
  DEFAULT: 20,
  MAX: 100,
};

// ❌ BAD
export const isPublicKey = 'isPublic';
export const maxRetryAttempts = 3;
```

#### Enums
- **PascalCase** for enum names
- **UPPER_SNAKE_CASE** for enum values

```typescript
// ✅ GOOD
export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum OrderStatus {
  PENDING = 1,
  PAID = 2,
  CANCELLED = 3,
}

// ❌ BAD
export enum role { }
export enum OrderStatus {
  pending = 1,  // Wrong casing
}
```

### 4.4 Database Column Names

- **snake_case** for database column names
- Map to **camelCase** in entities using `@Column({ name: 'column_name' })`

```typescript
// ✅ GOOD
@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;
}

// ❌ BAD
@Entity('users')
export class User extends BaseEntity {
  @Column()
  last_login_at: Date;  // Should be mapped to camelCase
}
```

---

## 5. File Naming Conventions

### 5.1 General Rules
- Use **kebab-case** for all file names
- Use descriptive, meaningful names
- Include type suffix before extension

### 5.2 File Type Patterns

| File Type | Pattern | Example |
|-----------|---------|---------|
| Module | `*.module.ts` | `users.module.ts` |
| Controller | `*.controller.ts` | `users.controller.ts` |
| Service | `*.service.ts` | `users.service.ts` |
| Entity | `*.entity.ts` | `user.entity.ts` |
| DTO | `*.dto.ts` | `create-user.dto.ts` |
| Repository | `*.repository.ts` | `user.repository.ts` |
| Guard | `*.guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `*.interceptor.ts` | `transform.interceptor.ts` |
| Decorator | `*.decorator.ts` | `public.decorator.ts` |
| Middleware | `*.middleware.ts` | `logger.middleware.ts` |
| Filter | `*.filter.ts` | `http-exception.filter.ts` |
| Pipe | `*.pipe.ts` | `validation.pipe.ts` |
| Interface | `*.interface.ts` | `jwt-payload.interface.ts` |
| Enum | `*.enum.ts` | `role.enum.ts` |
| Constant | `*.constant.ts` | `pagination-limits.constant.ts` |
| Util | `*.util.ts` | `date.util.ts` |
| Migration | `<timestamp>-<Name>.ts` | `1767225600000-CreateUsersAndApiLogs.ts` |
| Test | `*.spec.ts` | `users.service.spec.ts` |
| E2E Test | `*.e2e-spec.ts` | `app.e2e-spec.ts` |

### 5.3 Examples

```
✅ GOOD
src/modules/products/controllers/products.controller.ts
src/modules/products/services/products.service.ts
src/modules/products/dto/create-product.dto.ts
src/modules/products/entities/product.entity.ts
src/modules/products/repositories/product.repository.ts
src/common/guards/jwt-auth.guard.ts
src/common/decorators/public.decorator.ts
src/common/utils/date.util.ts

❌ BAD
src/modules/products/ProductsController.ts
src/modules/products/products_service.ts
src/modules/products/dto/CreateProduct.dto.ts
src/modules/products/entities/ProductEntity.ts
src/common/guards/JWTAuthGuard.ts
src/common/decorators/Public.ts
```

### 5.4 Directory Names
- Use **kebab-case** for directory names
- Use plural for feature modules (e.g., `users/`, `products/`)
- Use singular for utility directories (e.g., `common/`, `config/`)

```
✅ GOOD
src/modules/users/
src/modules/order-items/
src/common/decorators/
src/config/

❌ BAD
src/modules/User/
src/modules/OrderItems/
src/Common/Decorators/
```

---

## 6. Coding Conventions

### 6.1 TypeScript Configuration

Follow the project's `tsconfig.json` settings:
- **Strict checks:** `strictNullChecks`, `noImplicitAny`
- **Target:** ES2021
- **Module:** CommonJS
- **Decorators:** Enabled

### 6.2 Code Formatting

Use **Prettier** with the project's configuration:

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

**Run formatting and lint fixes:**
```bash
npm run lint          # auto-fix
npm run lint:check    # CI mode, no changes
```

### 6.3 Import Statements

#### Order of Imports
1. External libraries (NestJS, TypeORM, etc.)
2. Internal modules (using path aliases)
3. Relative imports

```typescript
// ✅ GOOD
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { CacheService } from '@core/cache/cache.service';
import { PaginationUtil } from '@common/utils';

import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from '../entities/product.entity';

// ❌ BAD
import { Product } from '../entities/product.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationUtil } from '@common/utils';
import { DataSource } from 'typeorm';
```

#### Use Path Aliases
The project uses TypeScript path aliases defined in `tsconfig.json` (mirrored in the Jest config):

```typescript
// ✅ GOOD
import { ApiResponseDto } from '@common/dto/api-response.dto';
import { CacheService } from '@core/cache/cache.service';
import { UsersService } from '@modules/users/services/users.service';

// ❌ BAD
import { ApiResponseDto } from '../../../common/dto/api-response.dto';
import { CacheService } from '../../../core/cache/cache.service';
```

**Available Aliases:**
- `@/*` → `src/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`
- `@jobs/*` → `src/jobs/*`
- `@gateways/*` → `src/gateways/*`

### 6.4 Type Annotations

#### Always Use Explicit Types
- For function parameters
- For function return types
- For class properties

```typescript
// ✅ GOOD
async findProductById(id: string): Promise<Product> {
  const product = await this.productRepository.findById(id);
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product;
}

private generateSku(): string {
  return StringUtil.generateRandomString(10).toUpperCase();
}

// ❌ BAD
async findProductById(id) {  // Missing type
  return await this.productRepository.findById(id);
}

private generateSku() {  // Missing return type
  return StringUtil.generateRandomString(10).toUpperCase();
}
```

#### Avoid `any` Type
- Use specific types or generics
- Use `unknown` if type is truly unknown
- Only use `any` when absolutely necessary (e.g., third-party library without types)

```typescript
// ✅ GOOD
interface ProductSearchParams {
  categoryIds?: string[];
  search?: string;
  limit: number;
}

async findProducts(params: ProductSearchParams): Promise<Product[]> { }

// ❌ BAD
async findProducts(params: any): Promise<any> { }
```

### 6.5 Async/Await

- **Always** use `async/await` instead of `.then()/.catch()`
- Handle errors with try-catch blocks where you can add context
- Use `Promise.all()` for independent parallel operations

```typescript
// ✅ GOOD
async issueTokens(user: AuthenticatedUser): Promise<AuthTokens> {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };

  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(payload),
    this.jwtService.signAsync(payload, { secret: this.configService.get('jwt.refreshSecret') }),
  ]);

  return { accessToken, refreshToken };
}

// ❌ BAD
issueTokens(user: AuthenticatedUser) {
  return this.jwtService.signAsync(payload)
    .then((accessToken) => this.jwtService.signAsync(payload, options)
      .then((refreshToken) => ({ accessToken, refreshToken })))
    .catch((error) => {
      throw error;
    });
}
```

### 6.6 Comments and Documentation

#### JSDoc for Public Methods
```typescript
/**
 * Returns a deep copy of `value` with every sensitive key (see `SENSITIVE_FIELDS`) masked.
 * Use before logging or persisting request payloads.
 *
 * @param value - Any JSON-like value
 * @returns A redacted copy; the input is never mutated
 */
export function redactSensitiveFields<T>(value: T): T {
  // Implementation
}
```

#### Inline Comments
- Use sparingly for complex logic
- Explain **why**, not **what**

```typescript
// ✅ GOOD
// Log after handle() so the body is parsed (e.g. multipart uploads)
return next.handle().pipe(tap(() => this.logRequest(request)));

// ❌ BAD
// Call next handle
return next.handle().pipe(tap(() => this.logRequest(request)));
```

### 6.7 Error Handling

Use NestJS built-in exceptions:

```typescript
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

// ✅ GOOD
async findOne(id: string): Promise<User> {
  const user = await this.userRepository.findById(id);

  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }

  return user;
}

// ❌ BAD
async findOne(id: string): Promise<User | null> {
  return this.userRepository.findById(id);
  // No error thrown, returns null
}
```

---

## 7. Architecture Patterns

### 7.1 Repository Pattern

**Always** create a custom repository per entity, extending `BaseRepository`:

**CRITICAL RULE:** Repositories should **ONLY** contain database queries. Data transformation and processing logic **MUST** reside in the Service layer. Do not put `transform()` or formatting methods inside repositories.

```typescript
// ✅ GOOD - Custom Repository (Query Only)
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(private readonly dataSource: DataSource) {
    super(Product, dataSource.createEntityManager());
  }

  async findWithFilters(params: ProductSearchParams): Promise<[Product[], number]> {
    const qb = this.createQueryBuilder('product')
      .select(['product.id', 'product.name', 'product.price'])
      .where('product.deletedAt IS NULL');

    if (params.search) {
      qb.andWhere('product.name LIKE :search', { search: `%${params.search}%` });
    }

    return qb.take(params.limit).skip(params.skip).getManyAndCount();
  }
}

// Service uses repository and handles transformation
@Injectable()
export class ProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async findAll(query: GetProductsDto): Promise<PaginatedResult<ProductResponseDto>> {
    const [products, total] = await this.productRepository.findWithFilters({
      search: query.search,
      limit: query.limit,
      skip: PaginationUtil.getSkip(query),
    });

    return PaginationUtil.buildResult(products.map((product) => this.toResponse(product)), total, query);
  }

  private toResponse(product: Product): ProductResponseDto {
    // ... transformation logic
  }
}

// ❌ BAD - Transformation in Repository
@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  async findWithFilters(params: ProductSearchParams) {
    const products = await qb.getMany();
    return products.map((p) => this.transform(p)); // ❌ DON'T DO THIS
  }

  transform(product: Product) { // ❌ DON'T DO THIS
    return { ...product, extraField: 'value' };
  }
}
```

See `docs/BASE_REPOSITORY.md` for the `withCount()` helpers.

### 7.2 DTO Pattern

#### Request DTOs
Use class-validator decorators for validation. Extend `PaginationQueryDto` for list endpoints:

```typescript
// ✅ GOOD
export class GetProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
```

#### Response DTOs
Use classes or interfaces for type safety, and never return secrets:

```typescript
// ✅ GOOD
export class ProductResponseDto {
  id: string;
  name: string;
  price: number;
  categoryName: string;
}
```

### 7.3 Service Layer

- **Single Responsibility:** Each service handles one domain
- **Dependency Injection:** Use constructor injection
- **Business Logic:** Keep business logic in services, not controllers
- **Cross-module access:** Call the other module's **service**, never its repository

```typescript
// ✅ GOOD
@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly usersService: UsersService, // exported by UsersModule
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<Order> {
    const user = await this.usersService.findOne(userId);
    return this.orderRepository.createAndSave({ ...dto, userId: user.id });
  }
}
```

### 7.4 Controller Layer

- **Thin Controllers:** Parse input and call exactly one service method
- **Use Decorators:** For validation, guards, and documentation
- **Return Data Directly:** The interceptor wraps the response

```typescript
// ✅ GOOD
@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List products' })
  findAll(@Query() query: GetProductsDto): Promise<PaginatedResult<ProductResponseDto>> {
    return this.productsService.findAll(query);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a product' })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }
}

// ❌ BAD
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly productRepository: ProductRepository, // ❌ Don't inject repository
  ) {}

  @Get()
  async findAll(@Query() query: any) { // ❌ No DTO validation
    // ❌ Business logic in controller
    const products = await this.productRepository.find({ where: { name: query.name } });

    // ❌ Manual response wrapping
    return { success: true, data: products };
  }
}
```

---

## 8. Database Conventions

### 8.1 Entity Definitions

Extend `BaseEntity` (`src/core/database/base.entity.ts`) to get a UUID `id`, `createdAt`, `updatedAt` and soft-delete `deletedAt`:

```typescript
// ✅ GOOD
@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Index('UQ_users_email', { unique: true })
  @Column({ length: 191 })
  email: string;

  @Exclude()
  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;
}
```

### 8.2 Column Mapping Rules

1. **Always map database columns to camelCase properties**
2. **Specify column type for non-standard types**
3. **Set nullable explicitly**
4. **Use default values where appropriate**
5. **Hide secrets with `select: false`**

```typescript
// ✅ GOOD
@Column({ name: 'is_featured', type: 'tinyint', width: 1, default: 0 })
isFeatured: boolean;

@Column({ name: 'stock_quantity', default: 0 })
stockQuantity: number;

// ❌ BAD
@Column()
is_featured: boolean;  // Not mapped to camelCase

@Column({ name: 'stock_quantity' })
stockQuantity: number;  // Missing nullable/default
```

### 8.3 Relationships

Define relationships explicitly:

```typescript
// ✅ GOOD
@Entity('orders')
export class Order extends BaseEntity {
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
```

### 8.4 Migrations

`synchronize` is disabled everywhere. Every schema change ships as a migration with working `up()` and `down()`:

```bash
npm run migration:create -- src/database/migrations/AddProducts   # empty migration
npm run migration:generate -- src/database/migrations/AddProducts # diff from entities
npm run migration:run
npm run migration:revert
```

Inline enum values in migrations instead of importing app enums, so old migrations never change.

### 8.5 Query Best Practices

#### Use QueryBuilder for Complex Queries
```typescript
// ✅ GOOD
const products = await this.createQueryBuilder('product')
  .innerJoin('product.category', 'category')
  .select(['product.id', 'product.name', 'category.name'])
  .where('category.id = :categoryId', { categoryId })
  .orderBy('product.createdAt', 'DESC')
  .take(limit)
  .skip(skip)
  .getMany();
```

#### Use Proper Indexing
```typescript
// Ensure database indexes exist for:
// - Foreign keys
// - Frequently queried columns
// - Columns used in WHERE, ORDER BY, JOIN
```

#### Avoid N+1 Queries
```typescript
// ✅ GOOD - Single query with join
const orders = await this.createQueryBuilder('order')
  .leftJoinAndSelect('order.items', 'item')
  .where('order.userId = :userId', { userId })
  .getMany();

// ❌ BAD - N+1 queries
const orders = await this.find({ where: { userId } });

for (const order of orders) {
  order.items = await this.orderItemRepository.find({ where: { orderId: order.id } });
  // This creates N additional queries!
}
```

---

## 9. API Development Guidelines

### 9.1 API Response Format

**All APIs return a consistent response format** (details in `API_RESPONSE_FORMAT.md`):

#### Success Response
```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

#### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-01-01T12:00:00.000Z",
  "path": "/api/v1/users",
  "message": ["email must be an email"]
}
```

**Implementation:**
- `TransformInterceptor` automatically wraps success responses
- `AllExceptionsFilter` automatically formats error responses
- Controllers return data directly (no manual wrapping)

```typescript
// ✅ GOOD
@Get()
findAll(@Query() query: PaginationQueryDto) {
  return this.usersService.findAll(query);
}

// ❌ BAD
@Get()
async findAll(@Query() query: PaginationQueryDto) {
  const data = await this.usersService.findAll(query);
  return { success: true, message: 'Success', data }; // Don't manually wrap!
}
```

### 9.2 API Versioning

URI versioning with a global prefix is configured in `main.ts`:

```typescript
// main.ts
app.setGlobalPrefix('api');
app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

// Controllers
@Controller('users')  // Results in /api/v1/users
export class UsersController {}
```

### 9.3 Pagination

**Standard pagination pattern** using `PaginationQueryDto` and `PaginationUtil`:

```typescript
// Repository
async findPaginated(pagination: PaginationParams): Promise<[User[], number]> {
  return this.findAndCount({
    skip: PaginationUtil.getSkip(pagination),
    take: pagination.limit,
  });
}

// Service
async findAll(query: PaginationQueryDto): Promise<PaginatedResult<User>> {
  const [users, total] = await this.userRepository.findPaginated(query);
  return PaginationUtil.buildResult(users, total, query);
}
// → { data: [...], meta: { total, page, limit, lastPage } }
```

### 9.4 Swagger Documentation

**Always document APIs with Swagger** (served at `/api/docs` outside production):

```typescript
@ApiTags('Products')
@Controller('products')
export class ProductsController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'List products' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }
}
```

After adding or changing an endpoint, update `API_DOCUMENTATION.md`.

---

## 10. Authentication & Authorization

### 10.1 JWT Authentication

The project uses JWT access tokens plus refresh tokens signed with separate secrets.

#### Login Flow
1. Register → `POST /api/v1/auth/register` or log in → `POST /api/v1/auth/login`
2. Server returns `accessToken` + `refreshToken`
3. Client sends `Authorization: Bearer <accessToken>`
4. When the access token expires → `POST /api/v1/auth/refresh`

### 10.2 Protecting Routes

`JwtAuthGuard` is registered globally (`APP_GUARD` in `AuthModule`), so **every route requires a token by default**.

#### Public Routes (No Authentication)
```typescript
@Controller('products')
export class ProductsController {
  @Public()  // Opt out of authentication explicitly
  @Get()
  findAll(@Query() query: GetProductsDto) {
    return this.productsService.findAll(query);
  }
}
```

#### Role-Restricted Routes
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }
}
```

### 10.3 Getting Current User

Use the `@CurrentUser()` decorator — it returns the `AuthenticatedUser` set by `JwtStrategy`:

```typescript
@Patch('me')
updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
  return this.usersService.updateProfile(user.id, dto);
}

// Or a single property
@Get('me/id')
getId(@CurrentUser('id') userId: string) {
  return userId;
}
```

---

## 11. Error Handling

### 11.1 Standard HTTP Exceptions

| Exception | Status Code | Use Case |
|-----------|-------------|----------|
| `BadRequestException` | 400 | Invalid input, validation errors |
| `UnauthorizedException` | 401 | Missing/invalid authentication |
| `ForbiddenException` | 403 | Authenticated but not authorized |
| `NotFoundException` | 404 | Resource not found |
| `ConflictException` | 409 | Duplicate resource |
| `InternalServerErrorException` | 500 | Unexpected server errors |

### 11.2 Exception Examples

```typescript
// ✅ GOOD
async create(dto: CreateUserDto): Promise<User> {
  if (await this.userRepository.existsByEmail(dto.email)) {
    throw new ConflictException('A user with this email already exists');
  }

  return this.userRepository.createAndSave({ ...dto, password: await PasswordUtil.hash(dto.password) });
}

async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
  if (dto.newPassword !== dto.confirmPassword) {
    throw new BadRequestException('New password and confirm password do not match');
  }
  // ...
}
```

### 11.3 Logging Errors

Log with the Winston-based `LoggerService` in services (never in controllers), and never log secrets or PII:

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly logger: LoggerService) {}

  async syncInventory(productId: string): Promise<void> {
    try {
      await this.inventoryClient.sync(productId);
    } catch (error) {
      this.logger.error(`Inventory sync failed for product ${productId}`, (error as Error).stack, ProductsService.name);
      throw error;
    }
  }
}
```

---

## 12. Testing Guidelines

See `TESTING_GUIDE.md` for templates and commands.

### 12.1 Unit Tests

Test services in isolation with mocked repositories, in the module's `__tests__/` folder:

```typescript
// src/modules/users/__tests__/services/users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UserRepository, useValue: { findById: jest.fn() } },
        { provide: LoggerService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UserRepository);
  });

  it('should throw NotFoundException when the user does not exist', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });
});
```

### 12.2 E2E Tests

Test complete API flows in `test/*.e2e-spec.ts` (requires a database):

```typescript
it('GET /api/v1/users requires authentication', () => {
  return request(app.getHttpServer()).get('/api/v1/users').expect(401);
});
```

### 12.3 Test Coverage

Aim for:
- **Unit Tests:** 80%+ coverage
- **E2E Tests:** Critical user flows
- **Integration Tests:** External service interactions

```bash
npm run test
npm run test:e2e
npm run test:cov
```

---

## 13. What TO DO ✅

### 13.1 Code Quality
- ✅ **Use TypeScript strict checks** - Keep `strictNullChecks` passing
- ✅ **Write descriptive variable names** - Code should be self-documenting
- ✅ **Add JSDoc comments** - Document public methods and complex logic
- ✅ **Use async/await** - Avoid callback hell and promise chains
- ✅ **Handle errors properly** - Throw appropriate Nest exceptions
- ✅ **Log important events** - Use `LoggerService` in services
- ✅ **Validate all inputs** - Use class-validator decorators in DTOs
- ✅ **Use environment variables** - Through `ConfigService`, never hardcoded

### 13.2 Architecture
- ✅ **Follow repository pattern** - All queries in repositories
- ✅ **Keep controllers thin** - Business logic belongs in services
- ✅ **Use dependency injection** - Constructor injection for all dependencies
- ✅ **Create custom decorators** - For reusable functionality
- ✅ **Use guards for authentication** - Global JWT guard + `@Public()` / `@Roles()`
- ✅ **Implement DTOs** - For request validation and response typing
- ✅ **Use interceptors** - For cross-cutting concerns (logging, transformation)

### 13.3 Database
- ✅ **Map column names to camelCase** - Use `@Column({ name: 'column_name' })`
- ✅ **Define relationships explicitly** - Use TypeORM decorators
- ✅ **Use transactions** - For operations that modify multiple tables
- ✅ **Create indexes** - For frequently queried columns
- ✅ **Use QueryBuilder** - For complex queries
- ✅ **Avoid N+1 queries** - Use joins
- ✅ **Write migrations** - With `up()` and `down()`

### 13.4 API Development
- ✅ **Return consistent responses** - Let the interceptor wrap responses
- ✅ **Document with Swagger** - Use `@ApiOperation`, `@ApiResponse`
- ✅ **Version your APIs** - `/api/v1/` prefix
- ✅ **Implement pagination** - For list endpoints
- ✅ **Use proper HTTP methods** - GET, POST, PUT, PATCH, DELETE
- ✅ **Return appropriate status codes** - 200, 201, 204, 400, 401, 403, 404, 409

### 13.5 Security
- ✅ **Validate all inputs** - Use class-validator
- ✅ **Sanitize user data** - Prevent XSS and SQL injection
- ✅ **Use HTTPS** - In production
- ✅ **Keep rate limiting on** - Global `ThrottlerGuard`
- ✅ **Hash passwords** - `PasswordUtil` (bcrypt)
- ✅ **Redact secrets** - Extend `SENSITIVE_FIELDS` for new sensitive inputs
- ✅ **Protect sensitive routes** - Use guards and roles

### 13.6 Performance
- ✅ **Use caching** - `CacheService` for frequently accessed data
- ✅ **Implement pagination** - Don't return all records
- ✅ **Use indexes** - For database queries
- ✅ **Optimize queries** - Select only needed columns
- ✅ **Use background jobs** - BullMQ for long-running tasks
- ✅ **Compress responses** - Compression middleware is enabled

---

## 14. What NOT TO DO ❌

### 14.1 Code Quality
- ❌ **Don't use `any` type** - Use specific types or generics
- ❌ **Don't ignore TypeScript errors** - Fix them, don't suppress
- ❌ **Don't use `console.log`** - Use `LoggerService` instead
- ❌ **Don't commit commented code** - Remove it or use version control
- ❌ **Don't hardcode values** - Use constants or configuration
- ❌ **Don't use magic numbers** - Define named constants or enums
- ❌ **Don't ignore errors** - Always handle or log them

### 14.2 Architecture
- ❌ **Don't put business logic in controllers** - Use services
- ❌ **Don't inject repositories in controllers** - Use services
- ❌ **Don't call another module's repository** - Use its service
- ❌ **Don't create circular dependencies** - Refactor module structure
- ❌ **Don't use global state** - Use dependency injection
- ❌ **Don't bypass validation** - Always validate DTOs
- ❌ **Don't manually wrap responses** - Let the interceptor handle it

### 14.3 Database
- ❌ **Don't use `SELECT *`** - Select only needed columns
- ❌ **Don't create N+1 queries** - Use joins
- ❌ **Don't run queries inside loops** - Batch them
- ❌ **Don't forget to add indexes** - For foreign keys and frequent queries
- ❌ **Don't use string-interpolated SQL** - Always parameterize
- ❌ **Don't expose database column names** - Map to camelCase
- ❌ **Don't enable `synchronize`** - Always create migrations

### 14.4 API Development
- ❌ **Don't return different response formats** - Be consistent
- ❌ **Don't expose internal errors** - Return user-friendly messages
- ❌ **Don't forget to document APIs** - Swagger + `API_DOCUMENTATION.md`
- ❌ **Don't use GET for mutations** - Use POST, PUT, PATCH, DELETE
- ❌ **Don't return all data** - Implement pagination
- ❌ **Don't forget versioning** - Use `/api/v1/`

### 14.5 Security
- ❌ **Don't store passwords in plain text** - Always hash
- ❌ **Don't commit secrets** - `.env` and credential files are gitignored
- ❌ **Don't log passwords or tokens** - Redact them
- ❌ **Don't trust user input** - Always validate and sanitize
- ❌ **Don't expose stack traces** - In production
- ❌ **Don't use weak JWT secrets** - Use strong, random secrets
- ❌ **Don't forget `@Public()` is opt-in** - Everything else requires auth

### 14.6 Performance
- ❌ **Don't load all records** - Use pagination
- ❌ **Don't block the event loop** - Use background jobs for heavy tasks
- ❌ **Don't forget to cache** - For frequently accessed data
- ❌ **Don't create memory leaks** - Clean up subscriptions and timers

---

## 15. Code Review Checklist

Before submitting a pull request, ensure:

### ✅ Code Quality
- [ ] `npm run build` passes, `npm run lint:check` has 0 errors
- [ ] Code follows naming conventions
- [ ] No `any` types (unless absolutely necessary)
- [ ] All functions have return type annotations
- [ ] Complex logic has comments
- [ ] No console.log statements
- [ ] No commented-out code

### ✅ Architecture
- [ ] Business logic is in services, not controllers
- [ ] All queries in repositories extending `BaseRepository`
- [ ] DTOs for request validation
- [ ] Proper dependency injection
- [ ] No circular dependencies
- [ ] `npm run lint:guidelines` passes

### ✅ Database
- [ ] Column names mapped to camelCase
- [ ] Relationships defined properly
- [ ] Indexes created for foreign keys
- [ ] No N+1 queries
- [ ] Migration with `up()` and `down()` for schema changes

### ✅ API
- [ ] Consistent response format
- [ ] Swagger documentation added
- [ ] `API_DOCUMENTATION.md` updated
- [ ] Proper HTTP methods used
- [ ] Pagination implemented for lists
- [ ] Validation on all inputs
- [ ] Appropriate status codes returned

### ✅ Security
- [ ] Public routes are intentional (`@Public()`)
- [ ] Input validation with class-validator
- [ ] No sensitive data in logs
- [ ] No secrets in code
- [ ] Passwords hashed

### ✅ Testing
- [ ] Unit tests written in `__tests__/`
- [ ] E2E tests for critical flows
- [ ] All tests passing
- [ ] Coverage meets minimum threshold

### ✅ Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] `.ai/steering/project-context.md` entry added
- [ ] JSDoc comments added

---

## 16. Common Pitfalls

### 16.1 TypeORM Issues

#### Pitfall: Column Name Mismatch
```typescript
// ❌ BAD - Property name doesn't match the snake_case column
@Column()
lastLoginAt: Date;  // Database column is 'last_login_at'

// ✅ GOOD
@Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
lastLoginAt: Date | null;
```

#### Pitfall: Missing Type Conversion
```typescript
// ❌ BAD - Boolean stored as tinyint not converted
@Column({ name: 'is_featured' })
isFeatured: boolean;

// ✅ GOOD
@Column({ name: 'is_featured', width: 1, type: 'tinyint' })
isFeatured: boolean;
```

#### Pitfall: Selecting Hidden Columns
```typescript
// ❌ BAD - password is select: false, so this is always undefined
const user = await this.userRepository.findById(id);
await PasswordUtil.verify(plain, user.password);

// ✅ GOOD - use the explicit repository method
const user = await this.userRepository.findByIdWithPassword(id);
```

### 16.2 Validation Issues

#### Pitfall: Missing Type Transformation
```typescript
// ❌ BAD - Query params are strings by default
export class GetProductsDto {
  @IsInt()
  page?: number;  // Will fail validation!
}

// ✅ GOOD
export class GetProductsDto {
  @Type(() => Number)  // Transform string to number
  @IsInt()
  page?: number;
}
```

### 16.3 Authentication Issues

#### Pitfall: Forgetting @Public() Decorator
```typescript
// ❌ BAD - The global JwtAuthGuard makes this route require a token
@Controller('products')
export class ProductsController {
  @Get()
  findAll() {}
}

// ✅ GOOD
@Controller('products')
export class ProductsController {
  @Public()  // Mark as public
  @Get()
  findAll() {}
}
```

### 16.4 Response Format Issues

#### Pitfall: Manual Response Wrapping
```typescript
// ❌ BAD
@Get()
async findAll() {
  const data = await this.service.findAll();
  return { success: true, message: 'Success', data };
}

// ✅ GOOD - Let interceptor wrap
@Get()
findAll() {
  return this.service.findAll();
}
```

### 16.5 Error Handling Issues

#### Pitfall: Returning Null Instead of Throwing
```typescript
// ❌ BAD - Returns null, client must check
async findProduct(id: string): Promise<Product | null> {
  return this.productRepository.findById(id);
}

// ✅ GOOD - Throws exception
async findProduct(id: string): Promise<Product> {
  const product = await this.productRepository.findById(id);
  if (!product) {
    throw new NotFoundException(`Product with ID ${id} not found`);
  }
  return product;
}
```

---

## Quick Reference

### Environment Setup
```bash
# Install dependencies
npm install

# Run development server
npm run start:dev

# Run production server
npm run build && npm run start:prod

# Run tests
npm run test
npm run test:e2e
npm run test:cov

# Lint and format
npm run lint
npm run lint:guidelines

# Database
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert
npm run seed
```

### Common Commands
```bash
# Generate module
nest g module modules/feature-name

# Generate controller
nest g controller modules/feature-name/controllers/feature-name --flat

# Generate service
nest g service modules/feature-name/services/feature-name --flat
```

### Path Aliases
- `@/*` → `src/*`
- `@common/*` → `src/common/*`
- `@config/*` → `src/config/*`
- `@core/*` → `src/core/*`
- `@modules/*` → `src/modules/*`
- `@jobs/*` → `src/jobs/*`
- `@gateways/*` → `src/gateways/*`

---

## Getting Help

### Resources
- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Project README](./README.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [API Response Format](./API_RESPONSE_FORMAT.md)
- [Testing Guide](./TESTING_GUIDE.md)
- [AI Agent Instructions](./AGENTS.md)
