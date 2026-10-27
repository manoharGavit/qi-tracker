import { describe, expect, it } from "vitest";

import { createDatabase, IN_MEMORY } from "../src/db/connection.js";
import { runMigrations } from "../src/db/migrate.js";
import { seedDemoUser, seedIfEmpty } from "../src/db/seed.js";
import { SEVERITIES, STATUSES } from "../src/modules/inspections/inspection.constants.js";

function freshDb() {
	const db = createDatabase(IN_MEMORY);
	runMigrations(db);
	return db;
}

const count = (db: ReturnType<typeof freshDb>, sql: string) =>
	(db.prepare(sql).get() as { n: number }).n;

describe("migrations", () => {
	it("are idempotent", () => {
		const db = freshDb();
		expect(() => runMigrations(db)).not.toThrow();
	});

	it("enforce enum CHECK constraints and the resolved-state invariant", () => {
		const db = freshDb();
		const { id: userId } = seedDemoUser(db);
		const insert = db.prepare(
			`INSERT INTO inspections (id, inspection_date, machine_id, defect_type, severity, status,
				resolution_note, resolved_at, created_by, created_at, updated_at)
			VALUES (?, '2026-10-01', 'M1', 'Other', ?, ?, ?, ?, ?, 'now', 'now')`
		);

		expect(() => insert.run("a", "Huge", "Open", null, null, userId)).toThrow(/CHECK/);
		expect(() => insert.run("b", "Minor", "Closed", null, null, userId)).toThrow(/CHECK/);
		expect(() => insert.run("c", "Minor", "Resolved", null, null, userId)).toThrow(/CHECK/);
		expect(() => insert.run("d", "Minor", "Open", null, null, "no-such-user")).toThrow(
			/FOREIGN KEY/
		);
		expect(() => insert.run("e", "Minor", "Resolved", "ok", "now", userId)).not.toThrow();
	});
});

describe("seedIfEmpty", () => {
	it("seeds the demo user and sample inspections once", () => {
		const db = freshDb();
		expect(seedIfEmpty(db)).toBe(true);
		expect(seedIfEmpty(db)).toBe(false);

		expect(count(db, "SELECT COUNT(*) AS n FROM users")).toBe(1);
		expect(count(db, "SELECT COUNT(*) AS n FROM inspections")).toBe(8);
		for (const severity of SEVERITIES) {
			expect(
				count(db, `SELECT COUNT(*) AS n FROM inspections WHERE severity = '${severity}'`)
			).toBeGreaterThan(0);
		}
		for (const status of STATUSES) {
			expect(
				count(db, `SELECT COUNT(*) AS n FROM inspections WHERE status = '${status}'`)
			).toBeGreaterThan(0);
		}
	});
});
