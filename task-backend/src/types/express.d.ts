import "express-serve-static-core";

import type { User } from "../modules/auth/user.repository.js";

declare module "express-serve-static-core" {
	interface Request {
		user?: User;
	}
}
