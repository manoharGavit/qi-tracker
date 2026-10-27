import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import Database from "better-sqlite3";

export type Db = Database.Database;

export const IN_MEMORY = ":memory:";

/** Opens (creating if needed) a SQLite database at `path`, or an in-memory one for `:memory:`. */
export function createDatabase(path: string): Db {
	const inMemory = path === IN_MEMORY;
	if (!inMemory) mkdirSync(dirname(resolve(path)), { recursive: true });

	const db = new Database(path);
	if (!inMemory) db.pragma("journal_mode = WAL");
	db.pragma("foreign_keys = ON");
	db.pragma("busy_timeout = 5000");
	return db;
}
