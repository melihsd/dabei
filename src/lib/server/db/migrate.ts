import { migrateDb, openDb } from './open';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

migrateDb(openDb(url));
console.log('migrations applied');
