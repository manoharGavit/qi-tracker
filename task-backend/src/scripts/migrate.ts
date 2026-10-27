import { loadEnv } from "../config/env.js";
import { createDatabase } from "../db/connection.js";
import { runMigrations } from "../db/migrate.js";

const env = loadEnv();
const db = createDatabase(env.DB_PATH);
runMigrations(db);
db.close();
console.log(`Migrations applied to ${env.DB_PATH}`);
