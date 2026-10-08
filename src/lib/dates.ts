export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
export type Weekday = (typeof WEEKDAYS)[number];
export type WeekKey = 'this' | 'next';

export type WeekDay = {
	iso: string;
	weekday: Weekday;
	label: string;
	dateLabel: string;
	/** Before today: shown disabled, cannot be changed. */
	past: boolean;
	today: boolean;
};

/** ISO date (YYYY-MM-DD) from local date parts, never via UTC. */
export function toISODate(d: Date): string {
	const mm = String(d.getMonth() + 1).padStart(2, '0');
	const dd = String(d.getDate()).padStart(2, '0');
	return `${d.getFullYear()}-${mm}-${dd}`;
}

export function parseISODate(iso: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
	const [y, m, d] = iso.split('-').map(Number);
	const date = new Date(y, m - 1, d);
	return toISODate(date) === iso ? date : null;
}

export function mondayOf(d: Date): Date {
	const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate());
	monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
	return monday;
}

export function weekdayOf(d: Date): Weekday {
	return WEEKDAYS[(d.getDay() + 6) % 7];
}

/** From Sunday on, next week is the default. */
export function defaultWeek(today: Date): WeekKey {
	return today.getDay() === 0 ? 'next' : 'this';
}

export function weekMonday(today: Date, week: WeekKey): Date {
	const monday = mondayOf(today);
	if (week === 'next') monday.setDate(monday.getDate() + 7);
	return monday;
}

export function parseWorkdays(workdays: string): Weekday[] {
	const set = new Set(workdays.split(',').map((s) => s.trim()));
	return WEEKDAYS.filter((w) => set.has(w));
}

export function parseSlots(slots: string): string[] {
	return slots
		.split(',')
		.map((s) => s.trim())
		.filter(Boolean);
}

export function weekDays(monday: Date, workdays: Weekday[], today: Date): WeekDay[] {
	const todayIso = toISODate(today);
	const weekday = new Intl.DateTimeFormat('en', { weekday: 'short' });
	return workdays.map((w) => {
		const d = new Date(monday);
		d.setDate(monday.getDate() + WEEKDAYS.indexOf(w));
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const iso = toISODate(d);
		return {
			iso,
			weekday: w,
			label: weekday.format(d),
			dateLabel: `${dd}.${mm}.`,
			past: iso < todayIso,
			today: iso === todayIso
		};
	});
}

/** True if `iso` is a configured workday from today until the end of next week. */
export function isBookableDate(iso: string, today: Date, workdays: Weekday[]): boolean {
	const date = parseISODate(iso);
	if (!date || !workdays.includes(weekdayOf(date))) return false;
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const end = weekMonday(today, 'next');
	end.setDate(end.getDate() + 6);
	return date >= start && date <= end;
}
