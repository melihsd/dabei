import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import * as schema from './schema';

/** Opens the SQLite file (creating its folder) with foreign keys enforced. Shared by the app and the CLI scripts. */
export function openDb(url: string) {
	mkdirSync(dirname(url), { recursive: true });
	const client = new Database(url);
	client.run('PRAGMA journal_mode = WAL');
	client.run('PRAGMA foreign_keys = ON');
	return drizzle({ client, schema });
}

type Db = ReturnType<typeof openDb>;

/** Applies pending migrations and makes sure the single settings row exists. Safe to run on every start. */
export function migrateDb(db: Db) {
	migrate(db, { migrationsFolder: './drizzle' });
	db.insert(schema.settings).values({ id: 1 }).onConflictDoNothing().run();
}
