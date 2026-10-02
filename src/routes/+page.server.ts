import { fail, redirect } from '@sveltejs/kit';
import {
	getActiveMember,
	getActiveMembers,
	getPresenceBetween,
	getSettings,
	togglePresence
} from '#lib/server/db/queries.js';
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
		const date = String(data.get('date') ?? '');
		const slot = String(data.get('slot') ?? '');

		const validSlot =
			settings.mode === 'day' ? slot === '' : parseSlots(settings.slots).includes(slot);
		if (!validSlot || !isBookableDate(date, new Date(), parseWorkdays(settings.workdays))) {
			return fail(400, { error: 'Invalid day.' });
		}

		togglePresence(locals.member.id, date, slot);
		return { ok: true };
	}
};
