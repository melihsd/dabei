import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { ADMIN_PASSWORD, COOKIE_SECRET } from '$app/env/private';

const ADMIN_COOKIE = 'dabei_admin';
const SESSION_SECONDS = 60 * 60 * 12;

function sign(payload: string) {
	return createHmac('sha256', COOKIE_SECRET).update(payload).digest('hex');
}

function safeEqual(a: string, b: string) {
	const ha = createHmac('sha256', 'cmp').update(a).digest();
	const hb = createHmac('sha256', 'cmp').update(b).digest();
	return timingSafeEqual(ha, hb);
}

export function adminConfigured() {
	return Boolean(ADMIN_PASSWORD && COOKIE_SECRET);
}

export function checkPassword(candidate: string) {
	return adminConfigured() && safeEqual(candidate, ADMIN_PASSWORD);
}

export function startAdminSession(cookies: Cookies) {
	const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
	const payload = `admin.${expires}`;
	cookies.set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: SESSION_SECONDS
	});
}

export function endAdminSession(cookies: Cookies) {
	cookies.delete(ADMIN_COOKIE, { path: '/' });
}

export function isAdmin(cookies: Cookies) {
	if (!adminConfigured()) return false;
	const raw = cookies.get(ADMIN_COOKIE);
	if (!raw) return false;

	const [role, expires, signature] = raw.split('.');
	if (role !== 'admin' || !expires || !signature) return false;
	if (!safeEqual(signature, sign(`${role}.${expires}`))) return false;
	return Number(expires) > Date.now() / 1000;
}
