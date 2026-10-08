PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_presence` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`member_id` integer NOT NULL,
	`date` text NOT NULL,
	`slot` integer DEFAULT 1 NOT NULL,
	`comment` text,
	`emojis` text DEFAULT '' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
-- Slots used to be stored as their time text ('' in day mode). Each old time goes to the
-- current slot whose start time is closest (exact match wins), day entries go to slot 1.
-- If two entries land in the same slot, the one with a note or emojis wins, then the newer one.
INSERT INTO `__new_presence`("id", "member_id", "date", "slot", "comment", "emojis", "created_at", "updated_at")
WITH RECURSIVE parts(pos, rest, item) AS (
	SELECT 0, coalesce((SELECT replace("slots", ' ', '') FROM `settings` WHERE "id" = 1), '') || ',', NULL
	UNION ALL
	SELECT pos + 1, substr(rest, instr(rest, ',') + 1), substr(rest, 1, instr(rest, ',') - 1)
	FROM parts WHERE rest <> ''
),
current_slots AS (
	SELECT pos, item,
		cast(substr(item, 1, 2) AS integer) * 60 + cast(substr(item, 4, 2) AS integer) AS start
	FROM parts WHERE pos > 0 AND item <> ''
),
old AS (
	SELECT p.*,
		cast(substr(p."slot", 1, 2) AS integer) * 60 + cast(substr(p."slot", 4, 2) AS integer) AS old_start
	FROM `presence` p
),
closest AS (
	SELECT o."id", c.pos, row_number() OVER (
		PARTITION BY o."id"
		ORDER BY c.item = o."slot" DESC, abs(c.start - o.old_start), c.pos
	) AS n
	FROM old o JOIN current_slots c
	WHERE o."slot" <> ''
),
mapped AS (
	SELECT o.*, coalesce(cl.pos, 1) AS new_slot
	FROM old o LEFT JOIN closest cl ON cl."id" = o."id" AND cl.n = 1
),
ranked AS (
	SELECT *, row_number() OVER (
		PARTITION BY "member_id", "date", new_slot
		ORDER BY ("comment" IS NOT NULL OR "emojis" <> '') DESC, "updated_at" DESC, "id" DESC
	) AS n
	FROM mapped
)
SELECT "id", "member_id", "date", new_slot, "comment", "emojis", "created_at", "updated_at"
FROM ranked WHERE n = 1;--> statement-breakpoint
DROP TABLE `presence`;--> statement-breakpoint
ALTER TABLE `__new_presence` RENAME TO `presence`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `presence_member_date_slot` ON `presence` (`member_id`,`date`,`slot`);