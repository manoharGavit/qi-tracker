import { ConflictError, NotFoundError } from "../../shared/errors.js";
import { SEVERITIES } from "./inspection.constants.js";
import type {
	Inspection,
	InspectionFilters,
	InspectionRepository,
	SeverityStatusCount
} from "./inspection.repository.js";
import type { CreateInspectionBody } from "./inspection.schema.js";

export type SummaryRow = SeverityStatusCount;

export interface InspectionService {
	list(filters: InspectionFilters): Inspection[];
	getById(id: string): Inspection;
	create(input: CreateInspectionBody, createdBy: string): Inspection;
	resolve(id: string, resolutionNote: string): Inspection;
	/** One row per severity, always in `SEVERITIES` order, zero-filled. */
	summary(): SummaryRow[];
}

export interface InspectionServiceOptions {
	now?: () => Date;
	generateId?: () => string;
}

export function createInspectionService(
	repository: InspectionRepository,
	{ now = () => new Date(), generateId = () => crypto.randomUUID() }: InspectionServiceOptions = {}
): InspectionService {
	const getById = (id: string): Inspection => {
		const inspection = repository.findById(id);
		if (!inspection) throw new NotFoundError(`Inspection ${id} not found`);
		return inspection;
	};

	return {
		list: (filters) => repository.list(filters),

		getById,

		create(input, createdBy) {
			return repository.insert({
				id: generateId(),
				inspectionDate: input.inspectionDate,
				machineId: input.machineId,
				defectType: input.defectType,
				severity: input.severity,
				remarks: input.remarks,
				createdBy,
				createdAt: now().toISOString()
			});
		},

		resolve(id, resolutionNote) {
			if (getById(id).status === "Resolved") {
				throw new ConflictError("Inspection is already resolved");
			}
			const resolved = repository.markResolved(id, resolutionNote, now().toISOString());
			// A concurrent request resolved it between the read and the guarded update.
			if (!resolved) throw new ConflictError("Inspection is already resolved");
			return resolved;
		},

		summary() {
			const counts = new Map(repository.countBySeverity().map((row) => [row.severity, row]));
			return SEVERITIES.map(
				(severity) => counts.get(severity) ?? { severity, open: 0, resolved: 0, total: 0 }
			);
		}
	};
}
