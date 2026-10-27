export const DEFECT_TYPES = [
	"Weave Defect",
	"Shade Variation",
	"Hole/Tear",
	"Count Deviation",
	"Other"
] as const;
export type DefectType = (typeof DEFECT_TYPES)[number];

/** Ordered most to least severe; summary rows follow this order. */
export const SEVERITIES = ["Critical", "Major", "Minor"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const STATUSES = ["Open", "Resolved"] as const;
export type Status = (typeof STATUSES)[number];

/** Higher rank = more severe. Drives severity sorting. */
export const SEVERITY_RANK: Record<Severity, number> = {
	Critical: 3,
	Major: 2,
	Minor: 1
};

export const SORT_FIELDS = ["inspectionDate", "severity", "createdAt"] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const MACHINE_ID_MAX_LENGTH = 50;
export const REMARKS_MAX_LENGTH = 1000;
export const RESOLUTION_NOTE_MIN_LENGTH = 3;
export const RESOLUTION_NOTE_MAX_LENGTH = 500;
