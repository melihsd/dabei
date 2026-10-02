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
	updateMember,
	updateSettings
} from '#lib/server/db/queries.js';
import { WEEKDAYS } from '#lib/dates.js';
import { MAX_NAME_LENGTH, isValidColor, isValidSlot, isWeekday } from '#lib/settings.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ cookies }) => {
	if (!isAdmin(cookies)) return { admin: false as const, configured: adminConfigured() };

	return {
		admin: true as const,
		settings: getSettings(),
		members: getAllMembers()
	};
};

function readMemberFields(data: FormData) {
	const name = String(data.get('name') ?? '').trim();
	const color = String(data.get('color') ?? '');
	const sortOrder = Number(data.get('sortOrder') ?? 0);

	if (!name || name.length > MAX_NAME_LENGTH) {
		return { error: `Name must be 1-${MAX_NAME_LENGTH} characters.` };
	}
	if (!isValidColor(color)) return { error: 'Pick a color.' };
	if (!Number.isInteger(sortOrder)) return { error: 'Order must be a whole number.' };
	return { values: { name, color, sortOrder } };
}

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
		if (slots.some((s) => !isValidSlot(s))) {
			return fail(400, { scope: 'settings', error: 'Slots look like 09:00-13:00, one per line.' });
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

	addMember: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'new', error: 'Not signed in.' });

		const fields = readMemberFields(await request.formData());
		if (!fields.values) return fail(400, { scope: 'new', error: fields.error });

		createMember(fields.values);
		return { scope: 'new', saved: true };
	},

	updateMember: async ({ request, cookies }) => {
		if (!isAdmin(cookies)) return fail(401, { scope: 'member', error: 'Not signed in.' });

		const data = await request.formData();
		const id = Number(data.get('id'));
		const fields = readMemberFields(data);
		if (!Number.isInteger(id) || !fields.values) {
			return fail(400, { scope: 'member', id, error: fields.error ?? 'Invalid member.' });
		}

		updateMember(id, { ...fields.values, active: data.get('active') === 'on' });
		return { scope: 'member', id, saved: true };
	}
};
