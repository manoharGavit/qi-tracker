import type { Request, RequestHandler } from "express";

import type { AuthService } from "../../modules/auth/auth.service.js";
import type { User } from "../../modules/auth/user.repository.js";
import { UnauthorizedError } from "../errors.js";

const BEARER_PREFIX = "Bearer ";

export function createRequireAuth(authService: AuthService): RequestHandler {
	return (req, _res, next) => {
		const header = req.get("authorization");
		if (!header?.startsWith(BEARER_PREFIX)) {
			throw new UnauthorizedError("Missing bearer token");
		}
		req.user = authService.authenticate(header.slice(BEARER_PREFIX.length).trim());
		next();
	};
}

/** Returns the user attached by `requireAuth`; throws if the route was not guarded. */
export function getAuthUser(req: Request): User {
	if (!req.user) throw new UnauthorizedError();
	return req.user;
}
