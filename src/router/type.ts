import express from "express";
import {
	getTypes,
	getTypeById,
	createType,
	updateType,
	deleteType,
} from "../controllers/type";
import {
	getTypeValidator,
	createTypeValidator,
	updateTypeValidator,
	deleteTypeValidator,
} from "../validators/type";
import { authenticatedMiddleware } from "../middlewares/authentication";
import { roleMiddleware } from "@/middlewares/authorization";

export default (router: express.Router) => {
	router.get("/types", authenticatedMiddleware, getTypes);
	router.get(
		"/types/:id",
		authenticatedMiddleware,
		getTypeValidator,
		getTypeById
	);
	router.post(
		"/types",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		createTypeValidator,
		createType
	);
	router.patch(
		"/types/:id",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		updateTypeValidator,
		updateType
	);
	router.delete(
		"/types/:id",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		deleteTypeValidator,
		deleteType
	);
};
