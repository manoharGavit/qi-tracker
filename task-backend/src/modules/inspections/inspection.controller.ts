import type { RequestHandler } from "express";
import type { ParamsDictionary } from "express-serve-static-core";

import { sendSuccess } from "../../shared/http.js";
import { getAuthUser } from "../../shared/middleware/requireAuth.js";
import type {
	CreateInspectionBody,
	ListInspectionsQuery,
	ResolveInspectionBody
} from "./inspection.schema.js";
import type { InspectionService } from "./inspection.service.js";

type IdParams = { id: string };

export function createInspectionController(service: InspectionService) {
	const list: RequestHandler<ParamsDictionary, unknown, unknown, ListInspectionsQuery> = (
		req,
		res
	) => {
		sendSuccess(res, service.list(req.query));
	};

	const create: RequestHandler<ParamsDictionary, unknown, CreateInspectionBody> = (req, res) => {
		sendSuccess(res, service.create(req.body, getAuthUser(req).id), 201);
	};

	const getById: RequestHandler<IdParams> = (req, res) => {
		sendSuccess(res, service.getById(req.params.id));
	};

	const resolve: RequestHandler<IdParams, unknown, ResolveInspectionBody> = (req, res) => {
		sendSuccess(res, service.resolve(req.params.id, req.body.resolutionNote));
	};

	const summary: RequestHandler = (_req, res) => {
		sendSuccess(res, service.summary());
	};

	return { list, create, getById, resolve, summary };
}
