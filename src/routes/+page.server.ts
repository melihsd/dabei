import { fail, redirect } from '@sveltejs/kit';
import {
	getActiveMember,
	getActiveMembers,
	getPresenceBetween,
	getSettings,
	setComment,
	togglePresence
} from '#lib/server/db/queries.js';
import type { Settings } from '#lib/server/db/schema.js';
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
import { MAX_COMMENT_LENGTH } from '#lib/constants.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!locals.member) return { member: null, members: getActiveMembers() };

	const settings = getSettings();
	if (!settings) throw new Error('Settings row missing. Run `bun run db:seed`.');

	const today = new Date();
	const param = url.searchParams.get('week');
	const week: WeekKey = param === 'this' || param === 'next' ? param : defaultWeek(today);
	const days = weekDays(weekMonday(today, week), parseWorkdays(settings.workdays));

	return {
		member: locals.member,
		members: [],
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

		const saved = setComment(locals.member.id, target.date, target.slot, comment || null);
		if (!saved) return fail(400, { error: 'Mark yourself as present first.' });
		return { ok: true };
	}
};

function readTarget(data: FormData, settings: Settings) {
	const date = String(data.get('date') ?? '');
	const slot = String(data.get('slot') ?? '');

	const validSlot =
		settings.mode === 'day' ? slot === '' : parseSlots(settings.slots).includes(slot);
	if (!validSlot || !isBookableDate(date, new Date(), parseWorkdays(settings.workdays)))
		return null;
	return { date, slot };
}
