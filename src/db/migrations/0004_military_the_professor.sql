PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_task_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`projectId` integer NOT NULL,
	FOREIGN KEY (`projectId`) REFERENCES `project_table`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_task_table`("id", "name", "created_at", "updated_at", "projectId") SELECT "id", "name", "created_at", "updated_at", "projectId" FROM `task_table`;--> statement-breakpoint
DROP TABLE `task_table`;--> statement-breakpoint
ALTER TABLE `__new_task_table` RENAME TO `task_table`;--> statement-breakpoint
PRAGMA foreign_keys=ON;