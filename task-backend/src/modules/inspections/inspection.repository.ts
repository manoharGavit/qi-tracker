import type { Db } from "../../db/connection.js";
import { DEFAULT_LIMIT, DEFAULT_PAGE, SEVERITIES, SEVERITY_RANK } from "./inspection.constants.js";
import type { DefectType, Severity, SortField, SortOrder, Status } from "./inspection.constants.js";

export interface Inspection {
	id: string;
	inspectionDate: string;
	machineId: string;
	defectType: DefectType;
	severity: Severity;
	remarks: string | null;
	status: Status;
	resolutionNote: string | null;
	resolvedAt: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
}

export interface InspectionFilters {
	severity?: Severity[] | undefined;
	status?: Status[] | undefined;
	/** Inclusive lower bound, `YYYY-MM-DD`. */
	from?: string | undefined;
	/** Inclusive upper bound, `YYYY-MM-DD`. */
	to?: string | undefined;
	sortBy: SortField;
	order: SortOrder;
	page?: number | undefined;
	limit?: number | undefined;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
	items: T[];
	pagination: PaginationMeta;
}

export type NewInspection = Pick<
	Inspection,
	| "id"
	| "inspectionDate"
	| "machineId"
	| "defectType"
	| "severity"
	| "remarks"
	| "createdBy"
	| "createdAt"
>;

export interface SeverityStatusCount {
	severity: Severity;
	open: number;
	resolved: number;
	total: number;
}

export interface InspectionRepository {
	list(filters: InspectionFilters): Inspection[];
	count(filters: InspectionFilters): number;
	listPaginated(filters: InspectionFilters): PaginatedResult<Inspection>;
	findById(id: string): Inspection | undefined;
	insert(inspection: NewInspection): Inspection;
	/** Resolves only if currently Open; returns `undefined` when no Open row matched. */
	markResolved(id: string, resolutionNote: string, resolvedAt: string): Inspection | undefined;
	/** Counts grouped by severity; severities with no rows are omitted. */
	countBySeverity(): SeverityStatusCount[];
}

interface InspectionRow {
	id: string;
	inspection_date: string;
	machine_id: string;
	defect_type: DefectType;
	severity: Severity;
	remarks: string | null;
	status: Status;
	resolution_note: string | null;
	resolved_at: string | null;
	created_by: string;
	created_at: string;
	updated_at: string;
}

function toInspection(row: InspectionRow): Inspection {
	return {
		id: row.id,
		inspectionDate: row.inspection_date,
		machineId: row.machine_id,
		defectType: row.defect_type,
		severity: row.severity,
		remarks: row.remarks,
		status: row.status,
		resolutionNote: row.resolution_note,
		resolvedAt: row.resolved_at,
		createdBy: row.created_by,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}

const SEVERITY_RANK_SQL = `CASE severity ${SEVERITIES.map(
	(severity) => `WHEN '${severity}' THEN ${SEVERITY_RANK[severity]}`
).join(" ")} END`;

// Whitelisted ORDER BY fragments: user input only ever selects a key, never reaches SQL directly.
const SORT_COLUMN_SQL: Record<SortField, string> = {
	inspectionDate: "inspection_date",
	severity: SEVERITY_RANK_SQL,
	createdAt: "created_at"
};

const SORT_DIRECTION_SQL: Record<SortOrder, string> = { asc: "ASC", desc: "DESC" };

const placeholders = (count: number) => Array.from({ length: count }, () => "?").join(", ");

function buildFilterConditions(filters: InspectionFilters) {
	const conditions: string[] = [];
	const params: (string | number)[] = [];

	if (filters.severity?.length) {
		conditions.push(`severity IN (${placeholders(filters.severity.length)})`);
		params.push(...filters.severity);
	}
	if (filters.status?.length) {
		conditions.push(`status IN (${placeholders(filters.status.length)})`);
		params.push(...filters.status);
	}
	if (filters.from) {
		conditions.push("inspection_date >= ?");
		params.push(filters.from);
	}
	if (filters.to) {
		conditions.push("inspection_date <= ?");
		params.push(filters.to);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	return { where, params };
}

export function createInspectionRepository(db: Db): InspectionRepository {
	const findByIdStmt = db.prepare<[string], InspectionRow>(
		"SELECT * FROM inspections WHERE id = ?"
	);
	const insertStmt = db.prepare<NewInspection>(
		`INSERT INTO inspections
			(id, inspection_date, machine_id, defect_type, severity, remarks, created_by, created_at, updated_at)
		VALUES
			(@id, @inspectionDate, @machineId, @defectType, @severity, @remarks, @createdBy, @createdAt, @createdAt)`
	);
	const markResolvedStmt = db.prepare<
		{ id: string; resolutionNote: string; resolvedAt: string },
		InspectionRow
	>(
		`UPDATE inspections
		SET status = 'Resolved', resolution_note = @resolutionNote, resolved_at = @resolvedAt, updated_at = @resolvedAt
		WHERE id = @id AND status = 'Open'
		RETURNING *`
	);
	const countBySeverityStmt = db.prepare<[], SeverityStatusCount>(
		`SELECT
			severity,
			SUM(status = 'Open') AS open,
			SUM(status = 'Resolved') AS resolved,
			COUNT(*) AS total
		FROM inspections
		GROUP BY severity`
	);

	return {
		count(filters) {
			const { where, params } = buildFilterConditions(filters);
			const sql = `SELECT COUNT(*) AS total FROM inspections ${where}`;
			const row = db.prepare<(string | number)[], { total: number }>(sql).get(...params);
			return row?.total ?? 0;
		},

		list(filters) {
			const { where, params } = buildFilterConditions(filters);
			const orderBy = `${SORT_COLUMN_SQL[filters.sortBy]} ${SORT_DIRECTION_SQL[filters.order]}`;
			let sql = `SELECT * FROM inspections ${where}
				ORDER BY ${orderBy}, inspection_date DESC, created_at DESC, id DESC`;

			const queryParams = [...params];
			if (filters.limit !== undefined) {
				const page = filters.page ?? DEFAULT_PAGE;
				const offset = (page - 1) * filters.limit;
				sql += " LIMIT ? OFFSET ?";
				queryParams.push(filters.limit, offset);
			}

			return db
				.prepare<(string | number)[], InspectionRow>(sql)
				.all(...queryParams)
				.map(toInspection);
		},

		listPaginated(filters) {
			const total = this.count(filters);
			const page = filters.page ?? DEFAULT_PAGE;
			const limit = filters.limit ?? DEFAULT_LIMIT;
			const totalPages = Math.max(1, Math.ceil(total / limit));
			const items = this.list({ ...filters, page, limit });

			return {
				items,
				pagination: {
					page,
					limit,
					total,
					totalPages,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1
				}
			};
		},

		findById(id) {
			const row = findByIdStmt.get(id);
			return row && toInspection(row);
		},

		insert(inspection) {
			insertStmt.run(inspection);
			const row = findByIdStmt.get(inspection.id);
			if (!row) throw new Error(`Inspection ${inspection.id} missing after insert`);
			return toInspection(row);
		},

		markResolved(id, resolutionNote, resolvedAt) {
			const row = markResolvedStmt.get({ id, resolutionNote, resolvedAt });
			return row && toInspection(row);
		},

		countBySeverity() {
			return countBySeverityStmt.all();
		}
	};
}
