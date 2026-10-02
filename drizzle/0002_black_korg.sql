ALTER TABLE `members` ADD `outline_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `members_outline_id_unique` ON `members` (`outline_id`);--> statement-breakpoint
ALTER TABLE `settings` ADD `auth_required` integer DEFAULT false NOT NULL;