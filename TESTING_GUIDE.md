# Testing Guide - Quick Reference

## Quick Commands

```bash
# Run all tests
npm test

# Run specific module
npm test -- users
npm test -- auth

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific file
npm test -- users.service.spec

# Run e2e tests (boots AppModule — requires a reachable database from .env)
npm run test:e2e
```

## Test Structure

Unit tests live next to the code they test, in a `__tests__/` folder mirrored by layer:

```
src/modules/{module}/__tests__/
├── services/          # Service layer tests
├── controllers/       # Controller layer tests
├── repositories/      # Repository layer tests
└── dto/              # DTO validation tests

src/common/utils/__tests__/   # Shared utility tests
src/config/__tests__/         # Configuration factory tests
test/*.e2e-spec.ts            # End-to-end tests (full AppModule)
```

Reference implementations: `src/modules/users/__tests__` and `src/modules/auth/__tests__`.

### Adding tests for a new module

1. Create the folders:
   ```bash
   mkdir -p src/modules/{module}/__tests__/{services,controllers,dto}
   ```
2. Copy the templates below (or the users module tests) and adapt them.
3. Mock every dependency of the class under test (repositories, other services, `LoggerService`).
4. Run `npm test -- {module}`.

## Writing New Tests

### 1. Service Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from '../../services/your.service';
import { YourRepository } from '../../repositories/your.repository';

describe('YourService', () => {
  let service: YourService;
  let repository: jest.Mocked<YourRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        { 
          provide: YourRepository, 
          useValue: { 
            findOne: jest.fn(),
            save: jest.fn() 
          } 
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = module.get(YourRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('yourMethod', () => {
    it('should do something', async () => {
      const mockData: any = { id: 1, name: 'Test' };
      repository.findOne.mockResolvedValue(mockData);

      const result = await service.yourMethod(1);

      expect(repository.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });
  });
});
```

### 2. Controller Test Template

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from '../../controllers/your.controller';
import { YourService } from '../../services/your.service';

describe('YourController', () => {
  let controller: YourController;
  let service: jest.Mocked<YourService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        { 
          provide: YourService, 
          useValue: { 
            findOne: jest.fn() 
          } 
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get(YourService);
  });

  describe('findOne', () => {
    it('should return data', async () => {
      const mockData: any = { id: 1 };
      service.findOne.mockResolvedValue(mockData);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockData);
    });
  });
});
```

### 3. DTO Test Template

```typescript
import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { YourDto } from '../../dto/your.dto';

describe('YourDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(YourDto, {
      field1: 'value1',
      field2: 'value2',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when required field is missing', async () => {
    const dto = plainToInstance(YourDto, {
      field2: 'value2',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    const fieldError = errors.find((e) => e.property === 'field1');
    expect(fieldError).toBeDefined();
  });
});
```

## Common Patterns

### Testing Async Methods
```typescript
it('should handle async operation', async () => {
  repository.findOne.mockResolvedValue(mockData);
  const result = await service.findOne(1);
  expect(result).toEqual(mockData);
});
```

### Testing Errors
```typescript
it('should throw NotFoundException', async () => {
  repository.findOne.mockResolvedValue(null);
  
  await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  await expect(service.findOne(999)).rejects.toThrow('Not found');
});
```

### Testing with Multiple Mocks
```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      YourService,
      { provide: Repository1, useValue: { method1: jest.fn() } },
      { provide: Repository2, useValue: { method2: jest.fn() } },
      { provide: ExternalService, useValue: { method3: jest.fn() } },
    ],
  }).compile();
});
```

### Testing Transformations
```typescript
it('should transform data correctly', async () => {
  const rawData = { id: 1, name: 'Test', extra: 'field' };
  repository.findOne.mockResolvedValue(rawData);

  const result = await service.findOne(1);

  expect(result).toHaveProperty('id', 1);
  expect(result).toHaveProperty('name', 'Test');
  expect(result).not.toHaveProperty('extra');
});
```

## Best Practices

### ✅ DO

- Use `any` type for mock data to avoid type issues
- Clear mocks after each test with `afterEach`
- Test both success and error scenarios
- Use descriptive test names
- Group related tests with `describe`
- Mock all external dependencies
- Test edge cases and boundary conditions

### ❌ DON'T

- Don't test implementation details
- Don't make tests depend on each other
- Don't use real database connections
- Don't skip error scenarios
- Don't forget to clear mocks
- Don't test framework code (NestJS internals)

## Debugging Tests

### Run single test
```bash
npm test -- -t "should return user by id"
```

### Run with verbose output
```bash
npm test -- --verbose
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Coverage Reports

### Generate coverage
```bash
npm test -- --coverage
```

### View HTML report
```bash
npm test -- --coverage
# Open coverage/lcov-report/index.html
```

### Coverage thresholds
Add to `package.json`:
```json
{
  "jest": {
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution**: Check import paths; `@common`, `@core`, `@modules`, ... aliases are mapped in the `jest` section of `package.json` (unit) and `test/jest-e2e.json` (e2e)

### Issue: "Reflect.getMetadata is not a function"
**Solution**: Add `import 'reflect-metadata';` at top of DTO tests

### Issue: "Type error in mock"
**Solution**: Use `any` type for mock data: `const mockData: any = {...}`

### Issue: "Test timeout"
**Solution**: Increase timeout: `jest.setTimeout(10000);`

### Issue: "Mock not being called"
**Solution**: Verify mock is set up before test runs in `beforeEach`

## Module-Specific Notes

### Users Module
- Password hashing is asserted with `PasswordUtil.verify`, never by comparing hashes
- Conflict (duplicate email) and not-found paths are covered
- Pagination meta is asserted via `PaginationUtil.buildResult`

### Auth Module
- `JwtService` and `ConfigService` are mocked; tokens are plain strings in tests
- Inactive accounts, wrong passwords and invalid refresh tokens must all be rejected

### Logging
- `redactSensitiveFields` is tested for nested objects, arrays and case-insensitive keys

## CI/CD Integration

### GitHub Actions

`.github/workflows/ci.yml` runs on every push and pull request:

```yaml
- run: npm ci
- run: npm run lint:check
- run: npm run lint:guidelines
- run: npm run build
- run: npm test -- --ci
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Class Validator](https://github.com/typestack/class-validator)
- [Class Transformer](https://github.com/typestack/class-transformer)
