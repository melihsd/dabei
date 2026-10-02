import { and, asc, eq, gte, lte } from 'drizzle-orm';
import { db } from './index';
import { members, presence, settings } from './schema';

export function getSettings() {
	return db.select().from(settings).where(eq(settings.id, 1)).get();
}

export function getActiveMembers() {
	return db
		.select()
		.from(members)
		.where(eq(members.active, true))
		.orderBy(asc(members.sortOrder), asc(members.id))
		.all();
}

export function getActiveMember(id: number) {
	return db
		.select()
		.from(members)
		.where(and(eq(members.id, id), eq(members.active, true)))
		.get();
}

export function getPresenceBetween(from: string, to: string) {
	return db
		.select({
			id: presence.id,
			memberId: presence.memberId,
			date: presence.date,
			slot: presence.slot,
			comment: presence.comment,
			name: members.name,
			color: members.color
		})
		.from(presence)
		.innerJoin(members, eq(members.id, presence.memberId))
		.where(and(gte(presence.date, from), lte(presence.date, to)))
		.orderBy(asc(members.sortOrder), asc(members.id))
		.all();
}

/** Adds the presence entry, or removes it if it already exists. */
export function togglePresence(memberId: number, date: string, slot: string) {
	const existing = db
		.select({ id: presence.id })
		.from(presence)
		.where(and(eq(presence.memberId, memberId), eq(presence.date, date), eq(presence.slot, slot)))
		.get();
	if (existing) {
		db.delete(presence).where(eq(presence.id, existing.id)).run();
	} else {
		db.insert(presence).values({ memberId, date, slot }).run();
	}
}

/** Sets or clears (null) the note on the member's own presence entry. Returns false if there is no entry. */
export function setComment(memberId: number, date: string, slot: string, comment: string | null) {
	const updated = db
		.update(presence)
		.set({ comment, updatedAt: new Date() })
		.where(and(eq(presence.memberId, memberId), eq(presence.date, date), eq(presence.slot, slot)))
		.returning({ id: presence.id })
		.all();
	return updated.length > 0;
}
