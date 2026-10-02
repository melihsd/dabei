import type { Member } from '#lib/server/db/schema.js';

declare global {
	namespace App {
		interface Locals {
			member: Member | null;
			authRequired: boolean;
		}
	}
}

export {};
