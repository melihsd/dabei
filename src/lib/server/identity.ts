import type { Cookies } from '@sveltejs/kit';
import { safeEqual, sign } from './signing.js';

export const MEMBER_COOKIE = 'dabei_member';

const ONE_YEAR = 60 * 60 * 24 * 365;

export function setMemberCookie(cookies: Cookies, memberId: number) {
	cookies.set(MEMBER_COOKIE, String(memberId), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: ONE_YEAR
	});
}

export function clearMemberCookie(cookies: Cookies) {
	cookies.delete(MEMBER_COOKIE, { path: '/' });
}

export function readMemberId(cookies: Cookies): number | null {
	const raw = cookies.get(MEMBER_COOKIE);
	const id = raw ? Number(raw) : NaN;
	return Number.isInteger(id) ? id : null;
}

// Signed login session, used when "Require login via Outline" is on.
// Unlike the plain name cookie above, it cannot be forged without COOKIE_SECRET.
export const SESSION_COOKIE = 'dabei_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function setSessionCookie(cookies: Cookies, memberId: number) {
	const payload = `${memberId}.${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
	cookies.set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: SESSION_SECONDS
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function readSessionMemberId(cookies: Cookies): number | null {
	const [id, expires, signature] = (cookies.get(SESSION_COOKIE) ?? '').split('.');
	if (!id || !expires || !signature) return null;
	if (!safeEqual(signature, sign(`${id}.${expires}`))) return null;
	if (Number(expires) <= Date.now() / 1000) return null;
	const memberId = Number(id);
	return Number.isInteger(memberId) ? memberId : null;
}
