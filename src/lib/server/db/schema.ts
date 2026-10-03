import { sqliteTable, integer, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const members = sqliteTable('members', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	color: text('color').notNull(), // hex, e.g. "#FF3B00"
	sortOrder: integer('sort_order').notNull().default(0),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	outlineId: text('outline_id').unique(), // set when the person signed in via Outline
	outlineAdmin: integer('outline_admin', { mode: 'boolean' }).notNull().default(false) // Outline role is admin, refreshed on every login
});

export const settings = sqliteTable('settings', {
	id: integer('id').primaryKey(), // always 1 – single row
	mode: text('mode', { enum: ['day', 'slots'] })
		.notNull()
		.default('day'),
	slots: text('slots').notNull().default('09:00-13:00,13:00-18:00'),
	workdays: text('workdays').notNull().default('mon,tue,wed,thu,fri')
});

export const presence = sqliteTable(
	'presence',
	{
		id: integer('id').primaryKey({ autoIncrement: true }),
		memberId: integer('member_id')
			.notNull()
			.references(() => members.id, { onDelete: 'cascade' }),
		date: text('date').notNull(), // ISO "2026-10-05"
		slot: text('slot').notNull().default(''), // '' in day mode, "09:00-13:00" in slot mode
		comment: text('comment'), // optional, max 140 chars
		emojis: text('emojis').notNull().default(''), // comma-separated, e.g. "🐶,🍺"; excludes a comment
		createdAt: integer('created_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date())
	},
	(t) => [uniqueIndex('presence_member_date_slot').on(t.memberId, t.date, t.slot)]
);

export type Member = typeof members.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Presence = typeof presence.$inferSelect;
