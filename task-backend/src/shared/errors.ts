export type ErrorCode =
	| "VALIDATION_FAILED"
	| "BAD_REQUEST"
	| "UNAUTHORIZED"
	| "NOT_FOUND"
	| "CONFLICT"
	| "INTERNAL_ERROR";

const HTTP_STATUS_BY_CODE: Record<ErrorCode, number> = {
	VALIDATION_FAILED: 422,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	NOT_FOUND: 404,
	CONFLICT: 409,
	INTERNAL_ERROR: 500
};

export class AppError extends Error {
	readonly code: ErrorCode;
	readonly status: number;
	readonly details?: unknown;

	constructor(code: ErrorCode, message: string, details?: unknown) {
		super(message);
		this.name = new.target.name;
		this.code = code;
		this.status = HTTP_STATUS_BY_CODE[code];
		this.details = details;
	}
}

export class ValidationError extends AppError {
	constructor(message: string, details?: unknown) {
		super("VALIDATION_FAILED", message, details);
	}
}

export class BadRequestError extends AppError {
	constructor(message: string) {
		super("BAD_REQUEST", message);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Authentication required") {
		super("UNAUTHORIZED", message);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super("NOT_FOUND", message);
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super("CONFLICT", message);
	}
}
