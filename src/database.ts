import { Knex, knex as knexConfig } from 'knex';
import { env } from './env';

export const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: env.DB_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  },
};

export const knex = knexConfig(config);
