import type { Response } from "express";

import type { ErrorCode } from "./errors.js";

export interface ApiSuccess<T> {
	success: true;
	data: T;
}

export interface ApiFailure {
	success: false;
	error: { code: ErrorCode; message: string; details?: unknown };
}

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
	const body: ApiSuccess<T> = { success: true, data };
	res.status(status).json(body);
}

export function sendFailure(res: Response, status: number, error: ApiFailure["error"]): void {
	const body: ApiFailure = { success: false, error };
	res.status(status).json(body);
}
