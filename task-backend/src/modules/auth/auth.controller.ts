import type { RequestHandler } from "express";

import { sendSuccess } from "../../shared/http.js";
import { getAuthUser } from "../../shared/middleware/requireAuth.js";
import type { LoginBody } from "./auth.schema.js";
import type { AuthService } from "./auth.service.js";

export function createAuthController(authService: AuthService) {
	const login: RequestHandler<Record<string, string>, unknown, LoginBody> = async (req, res) => {
		const result = await authService.login(req.body.email, req.body.password);
		sendSuccess(res, result);
	};

	const me: RequestHandler = (req, res) => {
		sendSuccess(res, getAuthUser(req));
	};

	return { login, me };
}
