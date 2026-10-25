import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DATABASE_URL } from '$app/env/private';

/**
 * The signing key is generated once and kept next to the SQLite file (owner-only), so sessions
 * survive restarts and the key never shows up in the logs. If it is lost, a new one is made and
 * everyone signs in again.
 */
function loadSecret() {
	const file = join(dirname(DATABASE_URL), '.cookie-secret');
	try {
		return readFileSync(file, 'utf8').trim();
	} catch {
		// First start: fall through and create it.
	}

	const generated = randomBytes(32).toString('hex');
	try {
		mkdirSync(dirname(file), { recursive: true });
		// 'wx' fails if another process created the file in the meantime; then we read theirs.
		writeFileSync(file, generated, { mode: 0o600, flag: 'wx' });
		return generated;
	} catch {
		try {
			return readFileSync(file, 'utf8').trim();
		} catch {
			console.warn(`Could not store a cookie key in ${file}. Sessions end on every restart.`);
			return generated;
		}
	}
}

const secret = loadSecret();

export function sign(payload: string) {
	return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string) {
	const ha = createHmac('sha256', 'cmp').update(a).digest();
	const hb = createHmac('sha256', 'cmp').update(b).digest();
	return timingSafeEqual(ha, hb);
}
