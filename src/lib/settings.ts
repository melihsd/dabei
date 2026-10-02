import { WEEKDAYS, type Weekday } from './dates.js';

export const MAX_NAME_LENGTH = 20;

const SLOT_PATTERN = /^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/;

/** A slot is "HH:MM-HH:MM". The end may be earlier than the start for slots that run past midnight. */
export function isValidSlot(slot: string) {
	if (!SLOT_PATTERN.test(slot)) return false;
	const [start, end] = slot.split('-');
	return start !== end;
}

export function isValidColor(color: string) {
	return /^#[0-9a-fA-F]{6}$/.test(color);
}

export function isWeekday(value: string): value is Weekday {
	return (WEEKDAYS as readonly string[]).includes(value);
}
