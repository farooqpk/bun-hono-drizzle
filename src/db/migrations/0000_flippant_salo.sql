CREATE TABLE `user_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_table_email_unique` ON `user_table` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `user_table` (`email`);