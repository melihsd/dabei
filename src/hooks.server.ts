import type { Handle } from '@sveltejs/kit/hooks';
import { getActiveMember } from '#lib/server/db/queries.js';
import { readMemberId } from '#lib/server/identity.js';

export const handle: Handle = ({ event, resolve }) => {
	const id = readMemberId(event.cookies);
	event.locals.member = (id !== null && getActiveMember(id)) || null;
	return resolve(event);
};
