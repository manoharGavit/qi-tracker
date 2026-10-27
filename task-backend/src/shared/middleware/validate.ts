import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import type { z } from "zod";

import { ValidationError } from "../errors.js";

type Location = "params" | "query" | "body";

export interface ValidationIssue {
	location: Location;
	path: string;
	message: string;
}

interface RequestSchemas<P, B, Q> {
	params?: z.ZodType<P>;
	body?: z.ZodType<B>;
	query?: z.ZodType<Q>;
}

/**
 * Parses `params`, `query` and `body` with the given Zod schemas and replaces them with the
 * parsed output, so downstream handlers can type the request with the schema output types.
 * Responds 422 with every issue found across all locations.
 */
export function validate<P = ParamsDictionary, B = unknown, Q = Record<string, unknown>>(
	schemas: RequestSchemas<P, B, Q>
): RequestHandler<P, unknown, B, Q> {
	return (req, _res, next) => {
		const issues: ValidationIssue[] = [];
		const parsed: Partial<Record<Location, unknown>> = {};

		for (const location of ["params", "query", "body"] as const) {
			const schema = schemas[location];
			if (!schema) continue;
			const result = schema.safeParse(req[location] ?? {});
			if (result.success) {
				parsed[location] = result.data;
			} else {
				for (const issue of result.error.issues) {
					issues.push({ location, path: issue.path.join("."), message: issue.message });
				}
			}
		}

		if (issues.length > 0) {
			throw new ValidationError("Request validation failed", issues);
		}

		if ("params" in parsed) req.params = parsed.params as P;
		if ("body" in parsed) req.body = parsed.body as B;
		if ("query" in parsed) {
			// Express 5 exposes `req.query` as a getter, so it must be redefined rather than assigned.
			Object.defineProperty(req, "query", {
				value: parsed.query,
				writable: true,
				configurable: true,
				enumerable: true
			});
		}
		next();
	};
}
