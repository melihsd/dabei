ALTER TABLE `settings` ADD `allowed_group` text;--> statement-breakpoint
ALTER TABLE `settings` ADD `outline_groups` text DEFAULT '[]' NOT NULL;