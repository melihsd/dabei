import { openDb } from './open';
import { members, settings } from './schema';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const db = openDb(url);

db.insert(settings).values({ id: 1 }).onConflictDoNothing().run();

// Placeholder members, only inserted into an empty table. Real members are managed in the settings page.
if (db.select().from(members).all().length === 0) {
	db.insert(members)
		.values([
			{ name: 'Anna', color: '#FF3B00', sortOrder: 0 },
			{ name: 'Ben', color: '#0057FF', sortOrder: 1 },
			{ name: 'Cem', color: '#00B84A', sortOrder: 2 }
		])
		.run();
}

console.log('seed done');
