import { loadEnv } from "../config/env.js";
import { createDatabase } from "../db/connection.js";
import { runMigrations } from "../db/migrate.js";
import { seedIfEmpty } from "../db/seed.js";

const env = loadEnv();
const db = createDatabase(env.DB_PATH);
runMigrations(db);
const seeded = seedIfEmpty(db);
db.close();
console.log(
	seeded ? `Seeded demo data into ${env.DB_PATH}` : "Database already has users; skipped seeding"
);
