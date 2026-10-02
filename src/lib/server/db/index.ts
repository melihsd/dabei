import { DATABASE_URL } from '$app/env/private';
import { openDb } from './open';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = openDb(DATABASE_URL);
