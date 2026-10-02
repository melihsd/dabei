import { MAX_NAME_LENGTH } from './constants.js';
import { WEEKDAYS, type Weekday } from './dates.js';

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

/** Trimmed name if it is 1..MAX_NAME_LENGTH characters, otherwise null. */
export function parseMemberName(raw: FormDataEntryValue | null): string | null {
	const name = String(raw ?? '').trim();
	return name && name.length <= MAX_NAME_LENGTH ? name : null;
}
