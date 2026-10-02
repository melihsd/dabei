import { fail, redirect } from '@sveltejs/kit';
import { getActiveMember, getActiveMembers } from '#lib/server/db/queries.js';
import { clearMemberCookie, setMemberCookie } from '#lib/server/identity.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	member: locals.member,
	members: locals.member ? [] : getActiveMembers()
});

export const actions: Actions = {
	pick: async ({ request, cookies }) => {
		const data = await request.formData();
		const member = getActiveMember(Number(data.get('memberId')));
		if (!member) return fail(400, { error: 'Pick a name from the list.' });

		setMemberCookie(cookies, member.id);
		redirect(303, '/');
	},

	switch: ({ cookies }) => {
		clearMemberCookie(cookies);
		redirect(303, '/');
	}
};
