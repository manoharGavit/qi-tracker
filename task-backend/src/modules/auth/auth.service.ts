import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

import { UnauthorizedError } from "../../shared/errors.js";
import type { User, UserRepository } from "./user.repository.js";

export const PASSWORD_HASH_ROUNDS = 10;

export interface AuthConfig {
	jwtSecret: string;
	jwtExpiresIn: string;
}

export interface LoginResult {
	token: string;
	user: User;
}

export interface AuthService {
	login(email: string, password: string): Promise<LoginResult>;
	/** Verifies a JWT and returns the (still existing) user it belongs to. */
	authenticate(token: string): User;
}

const INVALID_CREDENTIALS = "Invalid email or password";

// Compared against when the email is unknown so response timing does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", PASSWORD_HASH_ROUNDS);

export function createAuthService(users: UserRepository, config: AuthConfig): AuthService {
	const signOptions: SignOptions = {
		algorithm: "HS256",
		expiresIn: config.jwtExpiresIn as NonNullable<SignOptions["expiresIn"]>
	};

	return {
		async login(email, password) {
			const record = users.findByEmailWithPassword(email);
			const matches = await bcrypt.compare(password, record?.passwordHash ?? DUMMY_HASH);
			if (!record || !matches) throw new UnauthorizedError(INVALID_CREDENTIALS);

			const user: User = { id: record.id, email: record.email, name: record.name };
			const token = jwt.sign({}, config.jwtSecret, { ...signOptions, subject: user.id });
			return { token, user };
		},

		authenticate(token) {
			let subject: string | undefined;
			try {
				const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
				subject = typeof payload === "string" ? undefined : payload.sub;
			} catch {
				throw new UnauthorizedError("Invalid or expired token");
			}
			const user = subject ? users.findById(subject) : undefined;
			if (!user) throw new UnauthorizedError("Invalid or expired token");
			return user;
		}
	};
}
