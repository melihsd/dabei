import { redirect } from '@sveltejs/kit';
import { clearMemberCookie, clearSessionCookie } from '#lib/server/identity.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies }) => {
	clearSessionCookie(cookies);
	clearMemberCookie(cookies);
	redirect(303, '/');
};
