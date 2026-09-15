import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import databaseConfig from './database.config';

config({ quiet: true });

// `.ts` under ts-node (npm run migration:*), `.js` when run from dist/ (e.g. inside the Docker image)
const extension = __filename.endsWith('.ts') ? 'ts' : 'js';

/**
 * Standalone DataSource used by the TypeORM CLI (migrations) — the running app uses DatabaseModule.
 */
export default new DataSource({
  ...(databaseConfig() as DataSourceOptions),
  entities: [join(__dirname, '..', '**', `*.entity.${extension}`)],
  migrations: [
    join(__dirname, '..', 'database', 'migrations', `*.${extension}`),
  ],
});
