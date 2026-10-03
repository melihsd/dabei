ALTER TABLE `members` ADD `outline_admin` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `settings` DROP COLUMN `auth_required`;