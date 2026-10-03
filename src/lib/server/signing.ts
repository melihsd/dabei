import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { COOKIE_SECRET } from '$app/env/private';

// Without COOKIE_SECRET we sign with a random key for this process and say so once.
// Logins then end on every restart, so the message hands over a key to keep.
const secret = COOKIE_SECRET || randomBytes(32).toString('hex');
if (!COOKIE_SECRET) {
	console.warn(
		`\nCOOKIE_SECRET is not set. Using a temporary one, so admin and login sessions end on every restart.\nTo keep sessions, add this to your environment (.env):\n\n  COOKIE_SECRET=${secret}\n`
	);
}

export function sign(payload: string) {
	return createHmac('sha256', secret).update(payload).digest('hex');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string) {
	const ha = createHmac('sha256', 'cmp').update(a).digest();
	const hb = createHmac('sha256', 'cmp').update(b).digest();
	return timingSafeEqual(ha, hb);
}
