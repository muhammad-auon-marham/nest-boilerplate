import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Initial schema for the boilerplate: `users` (UsersModule) and `api_logs` (LoggingModule).
 * Enum values are inlined on purpose — migrations must not change when app enums evolve.
 */
export class CreateUsersAndApiLogs1767225600000 implements MigrationInterface {
  name = 'CreateUsersAndApiLogs1767225600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'varchar', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '100' },
          { name: 'email', type: 'varchar', length: '191' },
          { name: 'password', type: 'varchar', length: '255' },
          {
            name: 'role',
            type: 'enum',
            enum: ['super_admin', 'admin', 'user'],
            default: "'user'",
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'pending', 'suspended'],
            default: "'active'",
          },
          { name: 'last_login_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'updated_at',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
          },
          {
            name: 'deleted_at',
            type: 'datetime',
            precision: 6,
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'UQ_users_email',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'api_logs',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'action', type: 'varchar', length: '255', isNullable: true },
          { name: 'payload', type: 'text', isNullable: true },
          { name: 'app_type', type: 'tinyint', isNullable: true },
          { name: 'device_type', type: 'tinyint', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('api_logs');
    await queryRunner.dropIndex('users', 'UQ_users_email');
    await queryRunner.dropTable('users');
  }
}
