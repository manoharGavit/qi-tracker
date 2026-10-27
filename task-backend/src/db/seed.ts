import bcrypt from "bcryptjs";

import { PASSWORD_HASH_ROUNDS } from "../modules/auth/auth.service.js";
import { createUserRepository } from "../modules/auth/user.repository.js";
import type { User } from "../modules/auth/user.repository.js";
import type { DefectType, Severity } from "../modules/inspections/inspection.constants.js";
import { createInspectionRepository } from "../modules/inspections/inspection.repository.js";
import { toIsoDate } from "../shared/dates.js";
import type { Db } from "./connection.js";

export const DEMO_USER = {
	email: "supervisor@arvind.com",
	password: "Password@123",
	name: "Shop Floor Supervisor"
} as const;

interface SampleInspection {
	daysAgo: number;
	machineId: string;
	defectType: DefectType;
	severity: Severity;
	remarks: string | null;
	resolutionNote?: string;
}

const SAMPLE_INSPECTIONS: SampleInspection[] = [
	{
		daysAgo: 0,
		machineId: "LOOM-01",
		defectType: "Weave Defect",
		severity: "Critical",
		remarks: "Broken warp ends across a 2m section of the roll."
	},
	{
		daysAgo: 1,
		machineId: "LOOM-03",
		defectType: "Shade Variation",
		severity: "Major",
		remarks: "Visible shade difference between selvedge and centre."
	},
	{
		daysAgo: 1,
		machineId: "LOOM-07",
		defectType: "Hole/Tear",
		severity: "Critical",
		remarks: "Tear near roll end, approx. 5cm.",
		resolutionNote: "Damaged section cut out and roll re-inspected."
	},
	{
		daysAgo: 2,
		machineId: "LOOM-02",
		defectType: "Count Deviation",
		severity: "Minor",
		remarks: "Pick count 2% below spec."
	},
	{
		daysAgo: 3,
		machineId: "LOOM-05",
		defectType: "Other",
		severity: "Minor",
		remarks: "Oil stain on fabric surface.",
		resolutionNote: "Spot cleaned; loom lubrication point checked."
	},
	{
		daysAgo: 4,
		machineId: "LOOM-01",
		defectType: "Shade Variation",
		severity: "Major",
		remarks: null,
		resolutionNote: "Dye batch re-matched with lab sample."
	},
	{
		daysAgo: 5,
		machineId: "LOOM-04",
		defectType: "Weave Defect",
		severity: "Major",
		remarks: "Float defect repeating every 30cm."
	},
	{
		daysAgo: 6,
		machineId: "LOOM-06",
		defectType: "Hole/Tear",
		severity: "Minor",
		remarks: null
	}
];

export function seedDemoUser(db: Db): User {
	return createUserRepository(db).create({
		email: DEMO_USER.email,
		name: DEMO_USER.name,
		passwordHash: bcrypt.hashSync(DEMO_USER.password, PASSWORD_HASH_ROUNDS)
	});
}

export function seedSampleInspections(db: Db, createdBy: string, today = new Date()): void {
	const inspections = createInspectionRepository(db);
	SAMPLE_INSPECTIONS.forEach((sample, index) => {
		const date = new Date(today);
		date.setDate(date.getDate() - sample.daysAgo);
		// Stagger timestamps so createdAt ordering is deterministic.
		const createdAt = new Date(today.getTime() - (SAMPLE_INSPECTIONS.length - index) * 60_000);

		const { id } = inspections.insert({
			id: crypto.randomUUID(),
			inspectionDate: toIsoDate(date),
			machineId: sample.machineId,
			defectType: sample.defectType,
			severity: sample.severity,
			remarks: sample.remarks,
			createdBy,
			createdAt: createdAt.toISOString()
		});
		if (sample.resolutionNote) {
			inspections.markResolved(id, sample.resolutionNote, new Date(today).toISOString());
		}
	});
}

/** Seeds the demo supervisor and sample inspections, only when no users exist yet. */
export function seedIfEmpty(db: Db): boolean {
	if (createUserRepository(db).count() > 0) return false;
	db.transaction(() => {
		const user = seedDemoUser(db);
		seedSampleInspections(db, user.id);
	})();
	return true;
}
