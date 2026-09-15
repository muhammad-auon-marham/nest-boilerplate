---
inclusion: always
priority: critical
---

# CRITICAL CODING RULES - MANDATORY CHECKLIST

BEFORE WRITING ANY CODE, VERIFY EACH ITEM:

## Repository Pattern Checklist

BEFORE writing service code:
- Am I writing a query (createQueryBuilder, find, findOne)?
  - If YES in SERVICE → STOP! Move to repository
  - If YES in REPOSITORY → OK

- Does repository method exist?
  - If YES → Use it
  - If NO → Create in repository first

- Am I injecting Entity directly (`@InjectRepository(Entity)`)?
  - If YES → STOP! Create proper repository extending `BaseRepository`

- Am I calling another module's repository?
  - If YES → STOP! Call that module's service instead

VIOLATION EXAMPLE:
```typescript
// WRONG - In service
const result = await this.orderRepository
  .createQueryBuilder('order')
  .select('order.customerId')
  .where('order.id = :id', { id })
  .getRawOne();
```

CORRECT:
```typescript
// In repository
async findCustomerIdByOrderId(orderId: string): Promise<string | null> {
  const order = await this.findOne({ where: { id: orderId }, select: ['id', 'customerId'] });
  return order?.customerId ?? null;
}

// In service
const customerId = await this.orderRepository.findCustomerIdByOrderId(orderId);
```

## Import Path Checklist

- Going back 2+ directories?
  - If YES → Use @ alias
  - If NO → Relative OK

## Magic Values Checklist

- Comparing with a literal number/string (=== 1, === 'admin')?
  - If YES → Use enum or constant
  - If NO → OK

## Security Checklist

- Reading `process.env` in a service/controller? → Use `ConfigService`
- Logging or storing a password/token? → STOP! Redact it
- New public route? → Add `@Public()` deliberately; everything else needs a JWT

## PRE-WRITE VERIFICATION

Recite before writing:
1. Query? → Repository only
2. 2+ dirs? → Use @
3. Literal? → Use enum/constant
4. 3+ params? → Interface
5. Utility? → Utils folder
6. Request input? → DTO with class-validator
7. Schema change? → Migration with up() and down()
8. New code? → Unit test in `__tests__/`

If ANY fails → STOP and fix first
