import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { DEMO_USER } from "../src/db/seed.js";
import { dataOf, errorOf, setupTestApp, TEST_AUTH } from "./helpers.js";
import type { TestContext } from "./helpers.js";

let ctx: TestContext;

beforeEach(async () => {
	ctx = await setupTestApp();
});

describe("GET /api/health", () => {
	it("returns ok without auth", async () => {
		const res = await request(ctx.app).get("/api/health").expect(200);
		expect(res.body).toEqual({ success: true, data: { status: "ok" } });
	});
});

describe("POST /api/auth/login", () => {
	it("returns a token and the user for valid credentials", async () => {
		const res = await request(ctx.app)
			.post("/api/auth/login")
			.send({ email: "  Supervisor@Arvind.com ", password: DEMO_USER.password })
			.expect(200);

		const data = dataOf<{ token: string; user: unknown }>(res);
		expect(data.token).toEqual(expect.any(String));
		expect(data.user).toEqual({ id: ctx.user.id, email: DEMO_USER.email, name: DEMO_USER.name });
	});

	it.each([
		["wrong password", { email: DEMO_USER.email, password: "nope-nope" }],
		["unknown email", { email: "nobody@arvind.com", password: DEMO_USER.password }]
	])("returns 401 for %s", async (_label, body) => {
		const res = await request(ctx.app).post("/api/auth/login").send(body).expect(401);
		expect(res.body).toMatchObject({ success: false, error: { code: "UNAUTHORIZED" } });
	});

	it("returns 422 for a malformed body", async () => {
		const res = await request(ctx.app)
			.post("/api/auth/login")
			.send({ email: "not-an-email" })
			.expect(422);
		const error = errorOf(res);
		expect(error.code).toBe("VALIDATION_FAILED");
		expect(error.details).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ location: "body", path: "email" }),
				expect.objectContaining({ location: "body", path: "password" })
			])
		);
	});

	it("returns 400 for invalid JSON", async () => {
		const res = await request(ctx.app)
			.post("/api/auth/login")
			.set("Content-Type", "application/json")
			.send("{not json")
			.expect(400);
		expect(errorOf(res).code).toBe("BAD_REQUEST");
	});
});

describe("GET /api/auth/me", () => {
	it("returns the current user", async () => {
		const res = await ctx.authed.get("/api/auth/me").expect(200);
		expect(dataOf(res)).toEqual({ id: ctx.user.id, email: DEMO_USER.email, name: DEMO_USER.name });
	});

	it("returns 401 without a token", async () => {
		const res = await request(ctx.app).get("/api/auth/me").expect(401);
		expect(errorOf(res).code).toBe("UNAUTHORIZED");
	});

	it.each([
		["garbage token", "Bearer not-a-jwt"],
		[
			"wrong secret",
			`Bearer ${jwt.sign({}, "another-secret-that-is-32-chars-long!!", { subject: "x" })}`
		],
		[
			"expired token",
			`Bearer ${jwt.sign({ exp: Math.floor(Date.now() / 1000) - 60 }, TEST_AUTH.jwtSecret)}`
		],
		["unknown user", `Bearer ${jwt.sign({}, TEST_AUTH.jwtSecret, { subject: "ghost" })}`],
		["non-bearer scheme", "Basic abc"]
	])("returns 401 for %s", async (_label, header) => {
		const res = await request(ctx.app).get("/api/auth/me").set("Authorization", header).expect(401);
		expect(errorOf(res).code).toBe("UNAUTHORIZED");
	});
});

describe("route protection", () => {
	it.each([
		["get", "/api/inspections"],
		["post", "/api/inspections"],
		["get", "/api/inspections/summary"],
		["get", "/api/inspections/some-id"],
		["patch", "/api/inspections/some-id/resolve"]
	] as const)("%s %s returns 401 without a token", async (method, url) => {
		const res = await request(ctx.app)[method](url).expect(401);
		expect(errorOf(res).code).toBe("UNAUTHORIZED");
	});

	it("returns 404 NOT_FOUND for unknown routes", async () => {
		const res = await request(ctx.app).get("/api/nope").expect(404);
		expect(errorOf(res).code).toBe("NOT_FOUND");
	});
});
