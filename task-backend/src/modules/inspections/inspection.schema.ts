import { z } from "zod";

import { isIsoDate } from "../../shared/dates.js";
import {
	DEFECT_TYPES,
	MACHINE_ID_MAX_LENGTH,
	REMARKS_MAX_LENGTH,
	RESOLUTION_NOTE_MAX_LENGTH,
	RESOLUTION_NOTE_MIN_LENGTH,
	SEVERITIES,
	SORT_FIELDS,
	SORT_ORDERS,
	STATUSES
} from "./inspection.constants.js";

const isoDate = (label: string) =>
	z.string().trim().refine(isIsoDate, `${label} must be a valid date in YYYY-MM-DD format`);

const enumMessage = (label: string, values: readonly string[]) =>
	`${label} must be one of: ${values.join(", ")}`;

/**
 * Accepts `?key=a,b` and/or repeated `?key=a&key=b`; yields a de-duplicated array of enum values,
 * or `undefined` when nothing was supplied (no filtering).
 */
const csvEnumFilter = <const T extends readonly [string, ...string[]]>(label: string, values: T) =>
	z
		.union([z.string(), z.array(z.string())])
		.optional()
		.transform((raw) => {
			if (raw === undefined) return undefined;
			const items = (Array.isArray(raw) ? raw : [raw])
				.flatMap((value) => value.split(","))
				.map((value) => value.trim())
				.filter(Boolean);
			return items.length > 0 ? [...new Set(items)] : undefined;
		})
		.pipe(z.array(z.enum(values, { error: enumMessage(label, values) })).optional());

export const createInspectionSchema = z.object({
	inspectionDate: isoDate("Inspection date"),
	machineId: z
		.string({ error: "Machine ID is required" })
		.trim()
		.min(1, "Machine ID is required")
		.max(MACHINE_ID_MAX_LENGTH, `Machine ID must be at most ${MACHINE_ID_MAX_LENGTH} characters`),
	defectType: z.enum(DEFECT_TYPES, { error: enumMessage("Defect type", DEFECT_TYPES) }),
	severity: z.enum(SEVERITIES, { error: enumMessage("Severity", SEVERITIES) }),
	remarks: z
		.string()
		.trim()
		.max(REMARKS_MAX_LENGTH, `Remarks must be at most ${REMARKS_MAX_LENGTH} characters`)
		.nullish()
		.transform((value) => value || null)
});

export const resolveInspectionSchema = z.object({
	resolutionNote: z
		.string({ error: "Resolution note is required" })
		.trim()
		.min(
			RESOLUTION_NOTE_MIN_LENGTH,
			`Resolution note must be at least ${RESOLUTION_NOTE_MIN_LENGTH} characters`
		)
		.max(
			RESOLUTION_NOTE_MAX_LENGTH,
			`Resolution note must be at most ${RESOLUTION_NOTE_MAX_LENGTH} characters`
		)
});

export const listInspectionsQuerySchema = z
	.object({
		severity: csvEnumFilter("Severity", SEVERITIES),
		status: csvEnumFilter("Status", STATUSES),
		from: isoDate("from").optional(),
		to: isoDate("to").optional(),
		sortBy: z
			.enum(SORT_FIELDS, { error: enumMessage("sortBy", SORT_FIELDS) })
			.default("inspectionDate"),
		order: z.enum(SORT_ORDERS, { error: enumMessage("order", SORT_ORDERS) }).default("desc")
	})
	.refine((query) => !query.from || !query.to || query.from <= query.to, {
		message: "from must be on or before to",
		path: ["from"]
	});

export type CreateInspectionBody = z.output<typeof createInspectionSchema>;
export type ResolveInspectionBody = z.output<typeof resolveInspectionSchema>;
export type ListInspectionsQuery = z.output<typeof listInspectionsQuerySchema>;
