import { beforeEach, describe, expect, it } from "vitest";

import type { Inspection } from "../src/modules/inspections/inspection.repository.js";
import type { SummaryRow } from "../src/modules/inspections/inspection.service.js";
import type { ValidationIssue } from "../src/shared/middleware/validate.js";
import { dataOf, errorOf, setupTestApp, validPayload } from "./helpers.js";
import type { TestContext } from "./helpers.js";

let ctx: TestContext;

beforeEach(async () => {
	ctx = await setupTestApp();
});

const machineIds = (inspections: Inspection[]) => inspections.map((i) => i.machineId);

async function list(query = ""): Promise<Inspection[]> {
	const res = await ctx.authed.get(`/api/inspections${query}`).expect(200);
	return dataOf<Inspection[]>(res);
}

describe("POST /api/inspections", () => {
	it("creates an Open inspection and returns 201 with the full record", async () => {
		const res = await ctx.authed
			.post("/api/inspections", validPayload({ machineId: "  LOOM-09  ", remarks: "  Slub  " }))
			.expect(201);

		const inspection = dataOf<Inspection>(res);
		expect(inspection).toEqual({
			id: expect.any(String),
			inspectionDate: "2026-10-20",
			machineId: "LOOM-09",
			defectType: "Weave Defect",
			severity: "Major",
			remarks: "Slub",
			status: "Open",
			resolutionNote: null,
			resolvedAt: null,
			createdBy: ctx.user.id,
			createdAt: expect.any(String),
			updatedAt: expect.any(String)
		});
		expect(new Date(inspection.createdAt).toISOString()).toBe(inspection.createdAt);
	});

	it.each([undefined, null, "", "   "])("stores remarks %j as null", async (remarks) => {
		const inspection = await ctx.createInspection({ remarks });
		expect(inspection.remarks).toBeNull();
	});

	it("ignores client-supplied status", async () => {
		const res = await ctx.authed
			.post("/api/inspections", { ...validPayload(), status: "Resolved" })
			.expect(201);
		expect(dataOf<Inspection>(res).status).toBe("Open");
	});

	it.each([
		["missing body", {}, ["inspectionDate", "machineId", "defectType", "severity"]],
		["impossible date", validPayload({ inspectionDate: "2026-02-30" }), ["inspectionDate"]],
		["wrong date format", validPayload({ inspectionDate: "20/10/2026" }), ["inspectionDate"]],
		["blank machine id", validPayload({ machineId: "   " }), ["machineId"]],
		["machine id over 50 chars", validPayload({ machineId: "M".repeat(51) }), ["machineId"]],
		["unknown defect type", validPayload({ defectType: "Stain" }), ["defectType"]],
		["unknown severity", validPayload({ severity: "critical" }), ["severity"]],
		["remarks over 1000 chars", validPayload({ remarks: "r".repeat(1001) }), ["remarks"]]
	])("returns 422 for %s", async (_label, body, paths) => {
		const res = await ctx.authed.post("/api/inspections", body).expect(422);
		const error = errorOf(res);
		expect(error.code).toBe("VALIDATION_FAILED");
		expect((error.details as ValidationIssue[]).map((d) => d.path).sort()).toEqual(
			[...paths].sort()
		);
	});
});

describe("GET /api/inspections/:id", () => {
	it("returns the inspection", async () => {
		const created = await ctx.createInspection();
		const res = await ctx.authed.get(`/api/inspections/${created.id}`).expect(200);
		expect(dataOf(res)).toEqual(created);
	});

	it("returns 404 for an unknown id", async () => {
		const res = await ctx.authed.get("/api/inspections/does-not-exist").expect(404);
		expect(errorOf(res).code).toBe("NOT_FOUND");
	});
});

describe("GET /api/inspections (filters and sorting)", () => {
	beforeEach(async () => {
		// Created in this order; createdAt increases monotonically.
		await ctx.createInspection({ machineId: "A", severity: "Minor", inspectionDate: "2026-10-01" });
		await ctx.createInspection({
			machineId: "B",
			severity: "Critical",
			inspectionDate: "2026-10-05"
		});
		await ctx.createInspection({ machineId: "C", severity: "Major", inspectionDate: "2026-10-10" });
		const d = await ctx.createInspection({
			machineId: "D",
			severity: "Critical",
			inspectionDate: "2026-10-15"
		});
		await ctx.authed
			.patch(`/api/inspections/${d.id}/resolve`, { resolutionNote: "Fixed" })
			.expect(200);
	});

	it("defaults to inspectionDate descending", async () => {
		expect(machineIds(await list())).toEqual(["D", "C", "B", "A"]);
	});

	it("filters by a single severity", async () => {
		expect(machineIds(await list("?severity=Critical"))).toEqual(["D", "B"]);
	});

	it("filters by multiple comma-separated severities", async () => {
		expect(machineIds(await list("?severity=Critical,Minor"))).toEqual(["D", "B", "A"]);
	});

	it("accepts repeated query params", async () => {
		expect(machineIds(await list("?severity=Major&severity=Minor"))).toEqual(["C", "A"]);
	});

	it("filters by status", async () => {
		expect(machineIds(await list("?status=Resolved"))).toEqual(["D"]);
		expect(machineIds(await list("?status=Open"))).toEqual(["C", "B", "A"]);
		expect(machineIds(await list("?status=Open,Resolved"))).toEqual(["D", "C", "B", "A"]);
	});

	it("filters by an inclusive date range", async () => {
		expect(machineIds(await list("?from=2026-10-05&to=2026-10-10"))).toEqual(["C", "B"]);
		expect(machineIds(await list("?from=2026-10-10"))).toEqual(["D", "C"]);
		expect(machineIds(await list("?to=2026-10-01"))).toEqual(["A"]);
	});

	it("combines severity, status and date filters", async () => {
		expect(
			machineIds(await list("?severity=Critical,Major&status=Open&from=2026-10-05&to=2026-10-15"))
		).toEqual(["C", "B"]);
		expect(machineIds(await list("?severity=Minor&status=Resolved"))).toEqual([]);
	});

	it("treats an empty filter value as no filter", async () => {
		expect(await list("?severity=&status=")).toHaveLength(4);
	});

	it("sorts by severity rank, ties broken by newest inspection date", async () => {
		expect(machineIds(await list("?sortBy=severity&order=desc"))).toEqual(["D", "B", "C", "A"]);
		expect(machineIds(await list("?sortBy=severity&order=asc"))).toEqual(["A", "C", "D", "B"]);
	});

	it("sorts by inspectionDate ascending", async () => {
		expect(machineIds(await list("?sortBy=inspectionDate&order=asc"))).toEqual([
			"A",
			"B",
			"C",
			"D"
		]);
	});

	it("sorts by createdAt", async () => {
		expect(machineIds(await list("?sortBy=createdAt&order=asc"))).toEqual(["A", "B", "C", "D"]);
		expect(machineIds(await list("?sortBy=createdAt"))).toEqual(["D", "C", "B", "A"]);
	});

	it.each([
		["unknown severity", "?severity=Critical,Huge", "severity.1"],
		["unknown status", "?status=Closed", "status.0"],
		["bad from date", "?from=2026-13-01", "from"],
		["from after to", "?from=2026-10-10&to=2026-10-01", "from"],
		["unknown sortBy", "?sortBy=machineId", "sortBy"],
		["unknown order", "?order=sideways", "order"]
	])("returns 422 for %s", async (_label, query, path) => {
		const res = await ctx.authed.get(`/api/inspections${query}`).expect(422);
		const error = errorOf(res);
		expect(error.code).toBe("VALIDATION_FAILED");
		expect(error.details).toEqual([expect.objectContaining({ location: "query", path })]);
	});
});

describe("PATCH /api/inspections/:id/resolve", () => {
	it("resolves an Open inspection with a trimmed note", async () => {
		const created = await ctx.createInspection();
		const res = await ctx.authed
			.patch(`/api/inspections/${created.id}/resolve`, { resolutionNote: "  Rethreaded loom  " })
			.expect(200);

		const resolved = dataOf<Inspection>(res);
		expect(resolved).toMatchObject({
			id: created.id,
			status: "Resolved",
			resolutionNote: "Rethreaded loom"
		});
		expect(resolved.resolvedAt).toEqual(expect.any(String));
		expect(resolved.updatedAt).toBe(resolved.resolvedAt);
		expect(resolved.createdAt).toBe(created.createdAt);
	});

	it("returns 409 when resolving twice and keeps the original note", async () => {
		const created = await ctx.createInspection();
		const url = `/api/inspections/${created.id}/resolve`;
		await ctx.authed.patch(url, { resolutionNote: "First fix" }).expect(200);

		const res = await ctx.authed.patch(url, { resolutionNote: "Second fix" }).expect(409);
		expect(errorOf(res).code).toBe("CONFLICT");

		const current = await ctx.authed.get(`/api/inspections/${created.id}`).expect(200);
		expect(dataOf<Inspection>(current).resolutionNote).toBe("First fix");
	});

	it.each([
		["missing note", {}],
		["empty note", { resolutionNote: "" }],
		["whitespace note", { resolutionNote: "    " }],
		["too short note", { resolutionNote: "ab" }],
		["too long note", { resolutionNote: "n".repeat(501) }]
	])("returns 422 for %s", async (_label, body) => {
		const created = await ctx.createInspection();
		const res = await ctx.authed.patch(`/api/inspections/${created.id}/resolve`, body).expect(422);
		expect(errorOf(res).code).toBe("VALIDATION_FAILED");
	});

	it("returns 404 for an unknown id", async () => {
		const res = await ctx.authed
			.patch("/api/inspections/does-not-exist/resolve", { resolutionNote: "Fixed it" })
			.expect(404);
		expect(errorOf(res).code).toBe("NOT_FOUND");
	});
});

describe("GET /api/inspections/summary", () => {
	it("returns zero-filled rows for every severity when empty", async () => {
		const res = await ctx.authed.get("/api/inspections/summary").expect(200);
		expect(dataOf(res)).toEqual([
			{ severity: "Critical", open: 0, resolved: 0, total: 0 },
			{ severity: "Major", open: 0, resolved: 0, total: 0 },
			{ severity: "Minor", open: 0, resolved: 0, total: 0 }
		]);
	});

	it("counts open and resolved per severity in Critical, Major, Minor order", async () => {
		const c1 = await ctx.createInspection({ severity: "Critical" });
		await ctx.createInspection({ severity: "Critical" });
		await ctx.createInspection({ severity: "Critical" });
		const m1 = await ctx.createInspection({ severity: "Minor" });
		for (const { id } of [c1, m1]) {
			await ctx.authed
				.patch(`/api/inspections/${id}/resolve`, { resolutionNote: "Done" })
				.expect(200);
		}

		const res = await ctx.authed.get("/api/inspections/summary").expect(200);
		expect(dataOf<SummaryRow[]>(res)).toEqual([
			{ severity: "Critical", open: 2, resolved: 1, total: 3 },
			{ severity: "Major", open: 0, resolved: 0, total: 0 },
			{ severity: "Minor", open: 0, resolved: 1, total: 1 }
		]);
	});
});
