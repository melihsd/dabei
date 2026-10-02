import { createHmac, timingSafeEqual } from 'node:crypto';
import { COOKIE_SECRET } from '$app/env/private';

export function sign(payload: string) {
	return createHmac('sha256', COOKIE_SECRET).update(payload).digest('hex');
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string) {
	const ha = createHmac('sha256', 'cmp').update(a).digest();
	const hb = createHmac('sha256', 'cmp').update(b).digest();
	return timingSafeEqual(ha, hb);
}
