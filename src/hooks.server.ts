import { text } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { getActiveMember } from '#lib/server/db/queries.js';
import { readMemberId } from '#lib/server/identity.js';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const FORM_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];

/**
 * CSRF protection: a form post is only accepted if its Origin has the same host as the app.
 * Compares hosts, not protocols, so the app works on plain http as well as behind a TLS proxy.
 */
function isCrossSiteForm(request: Request) {
	if (!MUTATING.has(request.method)) return false;

	const contentType = request.headers.get('content-type');
	if (contentType && !FORM_TYPES.some((type) => contentType.startsWith(type))) return false;

	const origin = request.headers.get('origin');
	if (!origin) return true;

	const hosts = [request.headers.get('host'), request.headers.get('x-forwarded-host')];
	try {
		return !hosts.includes(new URL(origin).host);
	} catch {
		return true;
	}
}

export const handle: Handle = ({ event, resolve }) => {
	if (isCrossSiteForm(event.request)) {
		return text(`Cross-site ${event.request.method} form submissions are forbidden`, {
			status: 403
		});
	}

	const id = readMemberId(event.cookies);
	event.locals.member = (id !== null && getActiveMember(id)) || null;
	return resolve(event);
};
