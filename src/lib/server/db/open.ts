import { drizzle } from 'drizzle-orm/bun-sqlite';
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
