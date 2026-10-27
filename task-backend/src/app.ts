import cors from "cors";
import express from "express";
import type { Express } from "express";
import helmet from "helmet";

import type { Db } from "./db/connection.js";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { createAuthService } from "./modules/auth/auth.service.js";
import type { AuthConfig } from "./modules/auth/auth.service.js";
import { createUserRepository } from "./modules/auth/user.repository.js";
import { createInspectionRepository } from "./modules/inspections/inspection.repository.js";
import { createInspectionRouter } from "./modules/inspections/inspection.routes.js";
import { createInspectionService } from "./modules/inspections/inspection.service.js";
import type { InspectionServiceOptions } from "./modules/inspections/inspection.service.js";
import { sendSuccess } from "./shared/http.js";
import type { Logger } from "./shared/logger.js";
import { createErrorHandler, notFoundHandler } from "./shared/middleware/errorHandler.js";
import { createRequireAuth } from "./shared/middleware/requireAuth.js";

export interface AppDeps {
	db: Db;
	auth: AuthConfig;
	corsOrigins: string[];
	logger: Logger;
	inspectionOptions?: InspectionServiceOptions;
}

/** Composition root: wires repositories -> services -> routers. Has no I/O side effects. */
export function createApp({ db, auth, corsOrigins, logger, inspectionOptions }: AppDeps): Express {
	const authService = createAuthService(createUserRepository(db), auth);
	const inspectionService = createInspectionService(
		createInspectionRepository(db),
		inspectionOptions
	);
	const requireAuth = createRequireAuth(authService);

	const app = express();
	app.disable("x-powered-by");
	app.use(helmet());
	app.use(cors({ origin: corsOrigins }));
	app.use(express.json({ limit: "100kb" }));

	app.get("/api/health", (_req, res) => {
		sendSuccess(res, { status: "ok" });
	});
	app.use("/api/auth", createAuthRouter(authService, requireAuth));
	app.use("/api/inspections", requireAuth, createInspectionRouter(inspectionService));

	app.use(notFoundHandler);
	app.use(createErrorHandler(logger));
	return app;
}
