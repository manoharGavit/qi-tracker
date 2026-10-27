import { Router } from "express";
import type { RequestHandler } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { createAuthController } from "./auth.controller.js";
import { loginBodySchema } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export function createAuthRouter(authService: AuthService, requireAuth: RequestHandler): Router {
	const controller = createAuthController(authService);
	const router = Router();

	router.post("/login", validate({ body: loginBodySchema }), controller.login);
	router.get("/me", requireAuth, controller.me);

	return router;
}
