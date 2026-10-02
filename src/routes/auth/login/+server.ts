import { redirect } from '@sveltejs/kit';
import { authorizationUrl, outlineConfigured } from '#lib/server/outline.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ locals, cookies }) => {
	if (!locals.authRequired || !outlineConfigured()) redirect(303, '/');

	const state = crypto.randomUUID();
	cookies.set('dabei_oauth_state', state, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 300
	});
	// redirect() refuses external URLs, so build the response by hand.
	return new Response(null, {
		status: 303,
		headers: { location: authorizationUrl(state).toString() }
	});
};
