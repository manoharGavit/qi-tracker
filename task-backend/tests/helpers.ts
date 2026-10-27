import request from "supertest";
import type { Response } from "supertest";

import { createApp } from "../src/app.js";
import { createDatabase, IN_MEMORY } from "../src/db/connection.js";
import type { Db } from "../src/db/connection.js";
import { runMigrations } from "../src/db/migrate.js";
import { DEMO_USER, seedDemoUser } from "../src/db/seed.js";
import type { User } from "../src/modules/auth/user.repository.js";
import type { Inspection } from "../src/modules/inspections/inspection.repository.js";
import type { ApiFailure, ApiSuccess } from "../src/shared/http.js";
import { createLogger } from "../src/shared/logger.js";

export const TEST_AUTH = {
	jwtSecret: "test-secret-that-is-at-least-32-characters-long",
	jwtExpiresIn: "1h"
};

export interface TestContext {
	app: ReturnType<typeof createApp>;
	db: Db;
	user: User;
	token: string;
	authed: {
		get(url: string): request.Test;
		post(url: string, body?: object): request.Test;
		patch(url: string, body?: object): request.Test;
	};
	createInspection(overrides?: Partial<CreatePayload>): Promise<Inspection>;
}

export interface CreatePayload {
	inspectionDate: string;
	machineId: string;
	defectType: string;
	severity: string;
	remarks?: string | null;
}

export const validPayload = (overrides: Partial<CreatePayload> = {}): CreatePayload => ({
	inspectionDate: "2026-10-20",
	machineId: "LOOM-01",
	defectType: "Weave Defect",
	severity: "Major",
	remarks: "Loose threads",
	...overrides
});

export const dataOf = <T>(res: Response): T => (res.body as ApiSuccess<T>).data;
export const errorOf = (res: Response): ApiFailure["error"] => (res.body as ApiFailure).error;

/** Fresh in-memory app per call, with the demo user seeded and logged in. */
export async function setupTestApp(): Promise<TestContext> {
	const db = createDatabase(IN_MEMORY);
	runMigrations(db);
	const user = seedDemoUser(db);

	// Monotonic clock so createdAt ordering is deterministic within a test.
	let tick = Date.parse("2026-10-27T08:00:00.000Z");
	const app = createApp({
		db,
		auth: TEST_AUTH,
		corsOrigins: ["http://localhost:5173"],
		logger: createLogger("silent"),
		inspectionOptions: { now: () => new Date((tick += 1000)) }
	});

	const login = await request(app)
		.post("/api/auth/login")
		.send({ email: DEMO_USER.email, password: DEMO_USER.password });
	const { token } = dataOf<{ token: string }>(login);
	const auth = `Bearer ${token}`;

	const authed: TestContext["authed"] = {
		get: (url) => request(app).get(url).set("Authorization", auth),
		post: (url, body = {}) => request(app).post(url).set("Authorization", auth).send(body),
		patch: (url, body = {}) => request(app).patch(url).set("Authorization", auth).send(body)
	};

	return {
		app,
		db,
		user,
		token,
		authed,
		async createInspection(overrides) {
			const res = await authed.post("/api/inspections", validPayload(overrides)).expect(201);
			return dataOf<Inspection>(res);
		}
	};
}
