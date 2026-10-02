import { asc, eq } from 'drizzle-orm';
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
