import { fail, redirect } from '@sveltejs/kit';
import {
	adminConfigured,
	checkPassword,
	endAdminSession,
	isAdmin,
	startAdminSession
} from '#lib/server/admin.js';
import {
	createMember,
	getAllMembers,
	getSettings,
	deleteMember,
	memberNameExists,
	setAuthRequired,
	updateSettings
} from '#lib/server/db/queries.js';
import { outlineConfigured, outlineRedirectUri } from '#lib/server/outline.js';
import { WEEKDAYS } from '#lib/dates.js';
import { MAX_NAME_LENGTH, MEMBER_COLORS } from '#lib/constants.js';
import { isValidSlot, isWeekday, parseMemberName } from '#lib/settings.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	if (!isAdmin(cookies)) return { admin: false as const, configured: adminConfigured() };

	return {
		admin: true as const,
		settings: getSettings(),
		outline: { configured: outlineConfigured(), redirectUri: outlineRedirectUri ?? null },
		members: getAllMembers()
	};
};

export const actions: Actions = {
	login: async ({ request, cookies }) => {
		const data = await request.formData();
		if (!checkPassword(String(data.get('password') ?? ''))) {
			return fail(401, { scope: 'login', error: 'Wrong password.' });
		}
		startAdminSession(cookies);
		redirect(303, '/settings');
	},

	logout: ({ cookies }) => {
		endAdminSession(cookies);
		redirect(303, '/settings');
	},

	saveSettings: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'settings', error: 'Not signed in.' });

		const data = await request.formData();
		const mode = data.get('mode');
		const workdays = data.getAll('workdays').map(String).filter(isWeekday);
		const slots = String(data.get('slots') ?? '')
			.split(/[\n,]/)
			.map((s) => s.trim())
			.filter(Boolean);

		if (mode !== 'day' && mode !== 'slots') {
			return fail(400, { scope: 'settings', error: 'Invalid mode.' });
		}
		if (workdays.length === 0) {
			return fail(400, { scope: 'settings', error: 'Pick at least one workday.' });
		}
		const badSlot = slots.find((s) => !isValidSlot(s));
		if (badSlot) {
			return fail(400, {
				scope: 'settings',
				error: `"${badSlot}" is not a valid slot. Use HH:MM-HH:MM, e.g. 09:00-13:00.`
			});
		}
		if (mode === 'slots' && slots.length === 0) {
			return fail(400, { scope: 'settings', error: 'Slot mode needs at least one slot.' });
		}

		updateSettings({
			mode,
			slots: slots.join(','),
			workdays: WEEKDAYS.filter((w) => workdays.includes(w)).join(',')
		});
		return { scope: 'settings', saved: true };
	},

	saveAuth: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'auth', error: 'Not signed in.' });

		const enable = (await request.formData()).get('authRequired') === 'on';
		if (enable && !outlineConfigured()) {
			return fail(400, {
				scope: 'auth',
				error:
					'Set OUTLINE_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET and OAUTH_REDIRECT_URI on the server first.'
			});
		}

		setAuthRequired(enable);
		return { scope: 'auth', saved: true };
	},

	addMember: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'new', error: 'Not signed in.' });

		const name = parseMemberName((await request.formData()).get('name'));
		if (!name) {
			return fail(400, { scope: 'new', error: `Name must be 1-${MAX_NAME_LENGTH} characters.` });
		}
		if (memberNameExists(name)) return fail(400, { scope: 'new', error: 'That name exists.' });

		// The person picks their own color later; start with the next one in the palette.
		createMember(name, MEMBER_COLORS[getAllMembers().length % MEMBER_COLORS.length]);
		return { scope: 'new', saved: true };
	},

	removeMember: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'member', error: 'Not signed in.' });

		const id = Number((await request.formData()).get('id'));
		if (!Number.isInteger(id)) return fail(400, { scope: 'member', error: 'Invalid member.' });

		deleteMember(id);
		return { scope: 'member', saved: true };
	}
};
