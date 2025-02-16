PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_project_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`userId` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_project_table`("id", "name", "created_at", "updated_at", "userId") SELECT "id", "name", "created_at", "updated_at", "userId" FROM `project_table`;--> statement-breakpoint
DROP TABLE `project_table`;--> statement-breakpoint
ALTER TABLE `__new_project_table` RENAME TO `project_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;