# BaseRepository - Laravel-style Helpers for TypeORM

The `BaseRepository` (`src/common/repositories/base.repository.ts`) provides reusable, Eloquent-style helper methods for TypeORM repositories. It also sets `updatedAt` on `update()` and `createdAt` on `save()` automatically.

> `products`, `product_reviews` and `order_items` below are hypothetical tables used for illustration.

## Setup

### 1. Extend BaseRepository in your custom repositories

```typescript
import { BaseRepository } from '@common/repositories/base.repository';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
    constructor(private dataSource: DataSource) {
        super(Product, dataSource.createEntityManager());
    }
}
```

## Available Methods

### `withCount()` - Count Related Records

Works exactly like Laravel's `withCount()` method.

#### Basic Usage

```typescript
const queryBuilder = this.createQueryBuilder('product')
    .select(['product.id', 'product.name'])
    .where('product.id = :id', { id });

// Add a count of reviews
this.withCount(queryBuilder, 'reviews', 'reviewsCount');

const result = await queryBuilder.getRawAndEntities();
// result.raw[0].reviewsCount = 1087
```

#### With Conditions

```typescript
// Count only published reviews
this.withCount(
    queryBuilder,
    'reviews',
    'publishedReviewsCount',
    (qb) => {
        qb.where('review.isPublished = :isPublished', { isPublished: 1 })
          .andWhere('review.deletedAt IS NULL');
    }
);
```

### `withCounts()` - Multiple Counts at Once

```typescript
// Simple multiple counts
this.withCounts(queryBuilder, {
    reviews: 'reviewsCount',
    orderItems: 'orderItemsCount',
    images: 'imagesCount'
});

// With conditions
this.withCounts(queryBuilder, {
    reviews: {
        alias: 'publishedReviewsCount',
        conditions: (qb) => qb.where('review.isPublished = 1')
    },
    orderItems: {
        alias: 'paidOrderItemsCount',
        conditions: (qb) => qb.where('orderItem.status = :status', { status: OrderItemStatus.PAID })
    }
});
```

### `withCountEntity()` - Count from Different Table

Useful when you need to count from a table that doesn't have a direct relation.

```typescript
this.withCountEntity(
    queryBuilder,
    ProductReview,  // Entity class
    'reviewsCount', // Alias for the count
    (qb) => {
        qb.where('review.productId = product.id')
          .andWhere('review.deletedAt IS NULL')
          .andWhere('review.isPublished = :isPublished', { isPublished: 1 });
    },
    'review' // Alias for the entity in subquery
);
```

## Complete Example

```typescript
async findProductDetails(productId: string) {
    const queryBuilder = this.createQueryBuilder('product')
        .select([
            'product.id',
            'product.name',
            'product.price',
            // ... other fields
        ])
        .where('product.id = :productId', { productId });

    // Add multiple counts
    this.withCounts(queryBuilder, {
        reviews: {
            alias: 'publishedReviewsCount',
            conditions: (qb) => qb.where('review.isPublished = 1')
                                  .andWhere('review.deletedAt IS NULL')
        },
        orderItems: 'totalOrderItemsCount'
    });

    const result = await queryBuilder.getRawAndEntities();
    
    if (!result.entities[0]) {
        return null;
    }

    const entity = result.entities[0];
    const raw = result.raw[0];

    return {
        ...entity,
        publishedReviewsCount: parseInt(raw.publishedReviewsCount, 10) || 0,
        totalOrderItemsCount: parseInt(raw.totalOrderItemsCount, 10) || 0,
    };
}
```

## Generated SQL

The `withCount` methods generate optimized SQL with correlated subqueries, exactly like Laravel:

```sql
SELECT
    product.id AS id,
    product.name AS name,
    (
        SELECT COUNT(review.id)
        FROM product_reviews review
        WHERE review.product_id = product.id
        AND review.deleted_at IS NULL
        AND review.is_published = 1
    ) AS reviewsCount,
    (
        SELECT COUNT(orderItem.id)
        FROM order_items orderItem
        WHERE orderItem.product_id = product.id
    ) AS orderItemsCount
FROM products product
WHERE product.id = ?
```

## Benefits

✅ **Clean Code** - No messy inline subqueries  
✅ **Reusable** - Use the same method across all repositories  
✅ **Type-Safe** - Full TypeScript support  
✅ **Optimized** - Single query with subqueries (no N+1 problems)  
✅ **Laravel-like** - Familiar API for Laravel developers  
✅ **Scalable** - Easy to maintain and extend
