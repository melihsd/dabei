import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { openDb } from './open';
import { settings } from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const db = openDb(url);
migrate(db, { migrationsFolder: './drizzle' });

// The app expects the single settings row to exist.
db.insert(settings).values({ id: 1 }).onConflictDoNothing().run();
console.log('migrations applied');
