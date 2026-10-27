import { Router } from "express";

import { validate } from "../../shared/middleware/validate.js";
import { createInspectionController } from "./inspection.controller.js";
import {
	createInspectionSchema,
	listInspectionsQuerySchema,
	resolveInspectionSchema
} from "./inspection.schema.js";
import type { InspectionService } from "./inspection.service.js";

/** Expects to be mounted behind `requireAuth`. */
export function createInspectionRouter(service: InspectionService): Router {
	const controller = createInspectionController(service);
	const router = Router();

	router.get("/", validate({ query: listInspectionsQuerySchema }), controller.list);
	router.post("/", validate({ body: createInspectionSchema }), controller.create);
	// Must precede "/:id" so "summary" is not captured as an id.
	router.get("/summary", controller.summary);
	router.get("/:id", controller.getById);
	router.patch("/:id/resolve", validate({ body: resolveInspectionSchema }), controller.resolve);

	return router;
}
