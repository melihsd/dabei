import { redirect } from '@sveltejs/kit';
import { authorizationUrl, outlineConfigured } from '#lib/server/outline.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals, cookies, url }) => {
	if (!locals.authRequired || !outlineConfigured()) redirect(303, '/');

	const state = crypto.randomUUID();
	cookies.set('dabei_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 300
	});
	// Only one place to return to besides home: settings, after reloading the Outline groups.
	if (url.searchParams.get('next') === 'settings') {
		cookies.set('dabei_oauth_next', 'settings', {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			maxAge: 300
		});
	}
	// redirect() refuses external URLs, so build the response by hand.
	return new Response(null, {
		status: 303,
		headers: { location: authorizationUrl(state).toString() }
	});
};
