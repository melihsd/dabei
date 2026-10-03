import type { Cookies } from '@sveltejs/kit';
import { ADMIN_PASSWORD } from '$app/env/private';
import { safeEqual, sign } from './signing.js';

const ADMIN_COOKIE = 'dabei_admin';
const SESSION_SECONDS = 60 * 60 * 12;

export function adminConfigured() {
	return Boolean(ADMIN_PASSWORD);
}

export function checkPassword(candidate: string) {
	return Boolean(ADMIN_PASSWORD) && safeEqual(candidate, ADMIN_PASSWORD ?? '');
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

/** Admin by password cookie, or (while Outline login is on) by Outline admin role. */
export function canAdmin(event: {
	cookies: Cookies;
	locals: { member: { outlineAdmin: boolean } | null; authRequired: boolean };
}) {
	if (event.locals.authRequired && event.locals.member?.outlineAdmin) return true;
	return isAdmin(event.cookies);
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
