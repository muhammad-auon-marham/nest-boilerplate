import {
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
  UpdateResult,
  FindOptionsWhere,
} from 'typeorm';

/**
 * Base Repository with Laravel-style helper methods
 * Extend this class in your repositories to get withCount and other helpers
 * Automatically handles updated_at timestamps on update operations (like Laravel)
 */
export class BaseRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  /**
   * Override update to automatically set updated_at timestamp (like Laravel)
   * This ensures that every update operation updates the updatedAt field
   *
   * @param criteria - The criteria to find entities to update
   * @param partialEntity - The partial entity with fields to update
   * @returns UpdateResult
   */
  async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<Entity>
      | FindOptionsWhere<Entity>[],
    partialEntity: any,
  ): Promise<UpdateResult> {
    // Check if the entity has 'updatedAt' column
    const hasUpdatedAt = this.metadata.findColumnWithPropertyName('updatedAt');

    // Automatically add updatedAt timestamp if the entity has this field
    const entityToUpdate = hasUpdatedAt
      ? {
          ...partialEntity,
          updatedAt: new Date(),
        }
      : partialEntity;

    return super.update(criteria, entityToUpdate);
  }

  /**
   * Override save to automatically set createdAt timestamp if missing
   */
  async save<T extends Entity>(entity: T): Promise<T> {
    // Check if the entity has 'createdAt' column
    const hasCreatedAt = this.metadata.findColumnWithPropertyName('createdAt');

    // Automatically add createdAt timestamp if the entity has this field and it's missing
    if (hasCreatedAt && !entity['createdAt']) {
      (entity as any)['createdAt'] = new Date();
    }

    return super.save(entity);
  }

  /**
   * Add a "withCount" subquery to count related records
   * Works exactly like Laravel's withCount()
   *
   * @example
   * // Simple count
   * this.withCount(qb, 'reviews', 'reviewsCount')
   *
   * // Count with conditions
   * this.withCount(qb, 'reviews', 'reviewsCount', (subQb) => {
   *     subQb.where('review.deletedAt IS NULL')
   *          .andWhere('review.isPublished = :isPublished', { isPublished: 1 });
   * })
   *
   * @param queryBuilder - The main query builder
   * @param relation - The relation name (e.g., 'reviews')
   * @param alias - The alias for the count column (e.g., 'reviewsCount')
   * @param conditions - Optional callback to add WHERE conditions to the count
   * @param relationAlias - Optional alias for the relation in subquery (defaults to relation name)
   */
  protected withCount<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    relation: string,
    alias: string,
    conditions?: (qb: SelectQueryBuilder<any>) => void,
    relationAlias?: string,
  ): SelectQueryBuilder<T> {
    const relAlias = relationAlias || relation.replace(/s$/, ''); // Remove trailing 's' for alias
    const mainAlias = queryBuilder.alias;

    queryBuilder.addSelect((subQuery) => {
      const countQuery = subQuery
        .select(`COUNT(${relAlias}.id)`)
        .from(`${mainAlias}.${relation}`, relAlias);

      // Apply custom conditions if provided
      if (conditions) {
        conditions(countQuery);
      }

      return countQuery;
    }, alias);

    return queryBuilder;
  }

  /**
   * Add multiple "withCount" subqueries at once
   *
   * @example
   * this.withCounts(qb, {
   *     reviews: 'reviewsCount',
   *     orders: 'ordersCount'
   * })
   *
   * // With conditions
   * this.withCounts(qb, {
   *     reviews: {
   *         alias: 'publishedReviewsCount',
   *         conditions: (qb) => qb.where('review.isPublished = 1')
   *     }
   * })
   */
  protected withCounts<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    counts: Record<
      string,
      | string
      | { alias: string; conditions?: (qb: SelectQueryBuilder<any>) => void }
    >,
  ): SelectQueryBuilder<T> {
    Object.entries(counts).forEach(([relation, config]) => {
      if (typeof config === 'string') {
        this.withCount(queryBuilder, relation, config);
      } else {
        this.withCount(queryBuilder, relation, config.alias, config.conditions);
      }
    });

    return queryBuilder;
  }

  /**
   * Add a "withCount" using entity class (for non-relation counts)
   * Useful when you need to count from a different table with custom join conditions
   *
   * @example
   * this.withCountEntity(qb, ProductReview, 'reviewsCount', (subQb) => {
   *     subQb.where('review.productId = product.id')
   *          .andWhere('review.deletedAt IS NULL')
   *          .andWhere('review.isPublished = 1');
   * }, 'review')
   */
  protected withCountEntity<T extends ObjectLiteral, E extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    entityClass: new () => E,
    alias: string,
    conditions: (qb: SelectQueryBuilder<E>) => void,
    entityAlias: string = 'entity',
  ): SelectQueryBuilder<T> {
    queryBuilder.addSelect((subQuery) => {
      const countQuery = subQuery
        .select(`COUNT(${entityAlias}.id)`)
        .from(entityClass, entityAlias);

      conditions(countQuery);

      return countQuery;
    }, alias);

    return queryBuilder;
  }
}
