import type { Cookies } from '@sveltejs/kit';

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
