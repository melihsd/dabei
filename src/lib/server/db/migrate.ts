import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { openDb } from './open';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

migrate(openDb(url), { migrationsFolder: './drizzle' });
console.log('migrations applied');
