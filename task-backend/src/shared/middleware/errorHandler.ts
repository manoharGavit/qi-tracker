import type { ErrorRequestHandler, RequestHandler } from "express";

import { AppError, NotFoundError } from "../errors.js";
import { sendFailure } from "../http.js";
import type { Logger } from "../logger.js";

interface BodyParserError {
	type: string;
	status: number;
}

function isBodyParserError(err: unknown): err is BodyParserError {
	return (
		typeof err === "object" &&
		err !== null &&
		"type" in err &&
		typeof err.type === "string" &&
		"status" in err &&
		typeof err.status === "number" &&
		err.status >= 400 &&
		err.status < 500
	);
}

export const notFoundHandler: RequestHandler = (req) => {
	throw new NotFoundError(`Route ${req.method} ${req.path} not found`);
};

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
	return (err: unknown, _req, res, _next) => {
		if (err instanceof AppError) {
			sendFailure(res, err.status, {
				code: err.code,
				message: err.message,
				...(err.details === undefined ? {} : { details: err.details })
			});
			return;
		}

		if (isBodyParserError(err)) {
			const message =
				err.type === "entity.parse.failed" ? "Malformed JSON body" : "Invalid request body";
			sendFailure(res, 400, { code: "BAD_REQUEST", message });
			return;
		}

		logger.error({ err }, "Unhandled error");
		sendFailure(res, 500, { code: "INTERNAL_ERROR", message: "Something went wrong" });
	};
}
