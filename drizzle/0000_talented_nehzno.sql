CREATE TABLE `members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `presence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`date` text NOT NULL,
	`slot` text DEFAULT '' NOT NULL,
	`comment` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `presence_member_date_slot` ON `presence` (`member_id`,`date`,`slot`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY NOT NULL,
	`mode` text DEFAULT 'day' NOT NULL,
	`slots` text DEFAULT '09:00-13:00,13:00-18:00' NOT NULL,
	`workdays` text DEFAULT 'mon,tue,wed,thu,fri' NOT NULL
);
