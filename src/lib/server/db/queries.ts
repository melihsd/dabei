import { and, asc, eq } from 'drizzle-orm';
import { db } from './index';
import { members, settings } from './schema';

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
