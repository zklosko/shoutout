CREATE TABLE `child_codes` (
	`childCode` text PRIMARY KEY,
	`note` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `companion_buttons` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`page` integer NOT NULL,
	`row` integer NOT NULL,
	`col` integer NOT NULL,
	`variableName` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`type` text PRIMARY KEY,
	`host` text NOT NULL,
	`port` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY,
	`key` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY,
	`infoText` text NOT NULL,
	`approverUsername` text NOT NULL,
	`approverPassword` text NOT NULL,
	`skipApproval` integer NOT NULL,
	`port` integer NOT NULL
);
