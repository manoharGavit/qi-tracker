import { createApp } from "./app.js";
import { loadEnv } from "./config/env.js";
import { createDatabase } from "./db/connection.js";
import { runMigrations } from "./db/migrate.js";
import { seedIfEmpty } from "./db/seed.js";
import { createLogger } from "./shared/logger.js";

const env = loadEnv();
const logger = createLogger(env.LOG_LEVEL, env.NODE_ENV === "development");

const db = createDatabase(env.DB_PATH);
runMigrations(db);
if (seedIfEmpty(db)) logger.info("Seeded demo supervisor and sample inspections");

const app = createApp({
	db,
	auth: { jwtSecret: env.JWT_SECRET, jwtExpiresIn: env.JWT_EXPIRES_IN },
	corsOrigins: env.CORS_ORIGIN,
	logger
});

const server = app.listen(env.PORT, () => {
	logger.info(`API listening on http://localhost:${env.PORT}/api (db: ${env.DB_PATH})`);
});

function shutdown(signal: NodeJS.Signals): void {
	logger.info(`${signal} received, shutting down`);
	server.close(() => {
		db.close();
		process.exit(0);
	});
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
