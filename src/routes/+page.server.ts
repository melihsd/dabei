import { fail, redirect } from '@sveltejs/kit';
import {
	getActiveMember,
	createMember,
	getActiveMembers,
	memberNameExists,
	getPresenceBetween,
	getSettings,
	setNote,
	togglePresence,
	renameMember,
	updateMemberColor
} from '#lib/server/db/queries.js';
import { isValidColor, parseMemberName } from '#lib/settings.js';
import type { Settings } from '#lib/server/db/schema.js';
import { canAdmin } from '#lib/server/admin.js';
import { outlineConfigured, outlineProfileUrl } from '#lib/server/outline.js';
import { clearMemberCookie, setMemberCookie } from '#lib/server/identity.js';
import {
	defaultWeek,
	isBookableDate,
	parseSlots,
	parseWorkdays,
	weekDays,
	weekMonday,
	type WeekKey
} from '#lib/dates.js';
import { ENTRY_EMOJIS, MAX_COMMENT_LENGTH, MAX_NAME_LENGTH } from '#lib/constants.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url, cookies }) => {
	if (!locals.member) {
		return {
			member: null,
			// With login required, people sign in with Outline instead of picking a name.
			members: locals.authRequired ? [] : getActiveMembers(),
			authRequired: locals.authRequired,
			loginConfigured: outlineConfigured(),
			loginFailed: url.searchParams.get('login') === 'failed'
		};
	}

	const settings = getSettings();
	if (!settings) throw new Error('Settings row missing. Run `bun run db:seed`.');

	const today = new Date();
	const param = url.searchParams.get('week');
	const week: WeekKey = param === 'this' || param === 'next' ? param : defaultWeek(today);
	const days = weekDays(weekMonday(today, week), parseWorkdays(settings.workdays), today);

	return {
		member: locals.member,
		members: [],
		authRequired: locals.authRequired,
		isAdmin: canAdmin({ cookies, locals }),
		profileUrl: locals.authRequired ? outlineProfileUrl() : null,
		week,
		mode: settings.mode,
		slots: parseSlots(settings.slots),
		days,
		presence: days.length
			? getPresenceBetween(days[0].iso, days[days.length - 1].iso).filter((p) =>
					days.some((d) => d.iso === p.date)
				)
			: []
	};
};

export const actions: Actions = {
	pick: async ({ request, cookies, locals }) => {
		if (locals.authRequired) return fail(403, { error: 'Sign in with Outline.' });
		const data = await request.formData();
		const member = getActiveMember(Number(data.get('memberId')));
		if (!member) return fail(400, { error: 'Pick a name from the list.' });

		setMemberCookie(cookies, member.id);
		redirect(303, '/');
	},

	register: async ({ request, cookies, locals }) => {
		if (locals.authRequired) return fail(403, { error: 'Sign in with Outline.' });
		const data = await request.formData();
		const name = parseMemberName(data.get('name'));
		const color = String(data.get('color') ?? '');

		if (!name) return fail(400, { error: `Name must be 1-${MAX_NAME_LENGTH} characters.` });
		if (!isValidColor(color)) return fail(400, { error: 'Pick a color.' });
		if (memberNameExists(name)) {
			return fail(400, { error: 'That name is taken. Pick it from the list above.' });
		}

		setMemberCookie(cookies, createMember(name, color).id);
		redirect(303, '/');
	},

	color: async ({ request, locals }) => {
		if (!locals.member) return fail(401, { error: 'Pick your name first.' });

		const color = String((await request.formData()).get('color') ?? '');
		if (!isValidColor(color)) return fail(400, { error: 'Pick a color.' });

		updateMemberColor(locals.member.id, color);
		return { ok: true };
	},

	rename: async ({ request, locals }) => {
		if (locals.authRequired) return fail(403, { error: 'Your name comes from Outline.' });
		if (!locals.member) return fail(401, { error: 'Pick your name first.' });

		const name = parseMemberName((await request.formData()).get('name'));
		if (!name) return fail(400, { error: `Name must be 1-${MAX_NAME_LENGTH} characters.` });
		if (name.toLowerCase() !== locals.member.name.toLowerCase() && memberNameExists(name)) {
			return fail(400, { error: 'That name is taken.' });
		}

		renameMember(locals.member.id, name);
		return { ok: true };
	},

	switch: ({ cookies }) => {
		clearMemberCookie(cookies);
		redirect(303, '/');
	},

	toggle: async ({ request, locals }) => {
		if (!locals.member) return fail(401, { error: 'Pick your name first.' });

		const settings = getSettings();
		if (!settings) return fail(500, { error: 'Settings missing.' });

		const data = await request.formData();
		const target = readTarget(data, settings);
		if (!target) return fail(400, { error: 'Invalid day.' });

		togglePresence(locals.member.id, target.date, target.slot);
		return { ok: true };
	},

	comment: async ({ request, locals }) => {
		if (!locals.member) return fail(401, { error: 'Pick your name first.' });

		const settings = getSettings();
		if (!settings) return fail(500, { error: 'Settings missing.' });

		const data = await request.formData();
		const target = readTarget(data, settings);
		if (!target) return fail(400, { error: 'Invalid day.' });

		const comment = data.has('remove') ? '' : String(data.get('comment') ?? '').trim();
		if (comment.length > MAX_COMMENT_LENGTH) {
			return fail(400, { error: `Note is limited to ${MAX_COMMENT_LENGTH} characters.` });
		}

		// Emojis and a note exclude each other: any emoji wins and drops the note.
		const emojis = data.has('remove')
			? []
			: ENTRY_EMOJIS.filter((e) => data.getAll('emojis').includes(e));

		const saved = setNote(locals.member.id, target.date, target.slot, {
			comment: comment || null,
			emojis
		});
		if (!saved) return fail(400, { error: 'Mark yourself as present first.' });
		return { ok: true };
	}
};

function readTarget(data: FormData, settings: Settings) {
	const date = String(data.get('date') ?? '');
	const slot = Number(data.get('slot'));

	// Slot is the 1-based position; day mode always uses 1.
	const slotCount = settings.mode === 'day' ? 1 : parseSlots(settings.slots).length;
	const validSlot = Number.isInteger(slot) && slot >= 1 && slot <= slotCount;
	if (!validSlot || !isBookableDate(date, new Date(), parseWorkdays(settings.workdays)))
		return null;
	return { date, slot };
}
