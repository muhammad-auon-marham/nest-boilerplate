import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import databaseConfig from '../../config/database.config';
import { UserSeed } from './user.seed';

config({ quiet: true });

async function runSeeds(): Promise<void> {
  const { SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running seeds.',
    );
  }

  const dataSource = new DataSource({
    ...(databaseConfig() as DataSourceOptions),
    entities: ['src/**/*.entity.ts'],
  });

  await dataSource.initialize();

  try {
    await UserSeed.run(dataSource, {
      email: SEED_ADMIN_EMAIL,
      password: SEED_ADMIN_PASSWORD,
    });
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  runSeeds().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
