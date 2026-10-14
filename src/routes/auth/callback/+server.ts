import { redirect } from '@sveltejs/kit';
import { getSettings, memberForOutlineUser, saveOutlineGroups } from '#lib/server/db/queries.js';
import { setSessionCookie } from '#lib/server/identity.js';
import {
	fetchOutlineGroups,
	fetchOutlineUser,
	outlineConfigured,
	type OutlineUser
} from '#lib/server/outline.js';
import { safeEqual } from '#lib/server/signing.js';
import type { RequestHandler } from './$types';

/** Admins always get in; everyone else only if no group is set or they are in it. */
async function mayLogin(user: OutlineUser, token: string) {
	if (user.isAdmin) {
		// Keep the group list in settings fresh. A failure here must not block the admin.
		try {
			saveOutlineGroups(await fetchOutlineGroups(token));
		} catch (e) {
			console.error('Outline group list failed:', e instanceof Error ? e.message : e);
		}
		return true;
	}

	const allowedGroup = getSettings()?.allowedGroup;
	if (!allowedGroup) return true;
	const groups = await fetchOutlineGroups(token, user.id);
	return groups.some((g) => g.id === allowedGroup);
}

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
	if (!locals.authRequired || !outlineConfigured()) redirect(303, '/');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const expected = cookies.get('dabei_oauth_state');
	cookies.delete('dabei_oauth_state', { path: '/' });
	const next = cookies.get('dabei_oauth_next') === 'settings' ? '/settings' : '/';
	cookies.delete('dabei_oauth_next', { path: '/' });

	if (!code || !state || !expected || !safeEqual(state, expected)) redirect(303, '/?login=failed');

	let memberId: number | null;
	try {
		const { user, token } = await fetchOutlineUser(code);
		// Checked before the member is created, so people outside the group leave no trace.
		memberId = (await mayLogin(user, token)) ? memberForOutlineUser(user).id : null;
	} catch (e) {
		console.error('Outline login failed:', e instanceof Error ? e.message : e);
		redirect(303, '/?login=failed');
	}

	if (memberId === null) redirect(303, '/?login=denied');
	setSessionCookie(cookies, memberId);
	redirect(303, next);
};
