import {
	DEFECT_TYPES,
	MACHINE_ID_MAX_LENGTH,
	REMARKS_MAX_LENGTH,
	RESOLUTION_NOTE_MAX_LENGTH,
	SEVERITIES,
	STATUSES
} from "../modules/inspections/inspection.constants.js";
import type { Db } from "./connection.js";

const sqlList = (values: readonly string[]) =>
	values.map((value) => `'${value.replaceAll("'", "''")}'`).join(", ");

const ISO_DATE_GLOB = "[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
	id            TEXT PRIMARY KEY,
	email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
	name          TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inspections (
	id              TEXT PRIMARY KEY,
	inspection_date TEXT NOT NULL CHECK (inspection_date GLOB '${ISO_DATE_GLOB}'),
	machine_id      TEXT NOT NULL CHECK (length(machine_id) BETWEEN 1 AND ${MACHINE_ID_MAX_LENGTH}),
	defect_type     TEXT NOT NULL CHECK (defect_type IN (${sqlList(DEFECT_TYPES)})),
	severity        TEXT NOT NULL CHECK (severity IN (${sqlList(SEVERITIES)})),
	remarks         TEXT CHECK (remarks IS NULL OR length(remarks) <= ${REMARKS_MAX_LENGTH}),
	status          TEXT NOT NULL DEFAULT 'Open' CHECK (status IN (${sqlList(STATUSES)})),
	resolution_note TEXT CHECK (resolution_note IS NULL OR length(resolution_note) <= ${RESOLUTION_NOTE_MAX_LENGTH}),
	resolved_at     TEXT,
	created_by      TEXT NOT NULL REFERENCES users (id),
	created_at      TEXT NOT NULL,
	updated_at      TEXT NOT NULL,
	CHECK ((status = 'Resolved') = (resolution_note IS NOT NULL AND resolved_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections (status);
CREATE INDEX IF NOT EXISTS idx_inspections_severity ON inspections (severity);
CREATE INDEX IF NOT EXISTS idx_inspections_inspection_date ON inspections (inspection_date);
`;

/** Idempotent: safe to run on every boot. */
export function runMigrations(db: Db): void {
	db.exec(SCHEMA);
}
