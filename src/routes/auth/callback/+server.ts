import { redirect } from '@sveltejs/kit';
import { memberForOutlineUser } from '#lib/server/db/queries.js';
import { setSessionCookie } from '#lib/server/identity.js';
import { fetchOutlineUser, outlineConfigured } from '#lib/server/outline.js';
import { safeEqual } from '#lib/server/signing.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	if (!locals.authRequired || !outlineConfigured()) redirect(303, '/');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expected = cookies.get('dabei_oauth_state');
	cookies.delete('dabei_oauth_state', { path: '/' });

	if (!code || !state || !expected || !safeEqual(state, expected)) redirect(303, '/?login=failed');

	let memberId: number;
	try {
		memberId = memberForOutlineUser(await fetchOutlineUser(code)).id;
	} catch (e) {
		console.error('Outline login failed:', e instanceof Error ? e.message : e);
		redirect(303, '/?login=failed');
	}

	setSessionCookie(cookies, memberId);
	redirect(303, '/');
};
