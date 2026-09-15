import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';
import { LoggerService } from '../logger/logger.service';

export class TypeOrmCustomLogger implements TypeOrmLogger {
  constructor(private readonly logger: LoggerService) {}

  private safeStringify(parameters?: any[]) {
    if (!parameters) return '';
    try {
      return JSON.stringify(
        parameters,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
      );
    } catch {
      return '[Error serializing parameters]';
    }
  }

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    this.logger.log(
      `[Query]: ${query} -- Parameters: ${this.safeStringify(parameters)}`,
      'TypeOrm',
    );
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    this.logger.error(
      `[Query Error]: ${query} -- Parameters: ${this.safeStringify(parameters)} -- Error: ${error}`,
      '',
      'TypeOrm',
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    this.logger.warn(
      `[Slow Query]: ${query} -- Time: ${time}ms -- Parameters: ${this.safeStringify(parameters)}`,
      'TypeOrm',
    );
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`[Schema Build]: ${message}`, 'TypeOrm');
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    this.logger.log(`[Migration]: ${message}`, 'TypeOrm');
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ) {
    if (level === 'log' || level === 'info') {
      this.logger.log(message, 'TypeOrm');
    } else if (level === 'warn') {
      this.logger.warn(message, 'TypeOrm');
    }
  }
}
