import express from "express";
import {
	getLocations,
	getLocationById,
	createLocation,
	updateLocation,
	deleteLocation,
} from "../controllers/location";
import {
	getLocationValidator,
	createLocationValidator,
	updateLocationValidator,
	deleteLocationValidator,
} from "../validators/location";
import { authenticatedMiddleware } from "../middlewares/authentication";
import { roleMiddleware } from "../middlewares/authorization";

export default (router: express.Router) => {
	router.get("/locations", authenticatedMiddleware, getLocations);
	router.get(
		"/locations/:id",
		authenticatedMiddleware,
		getLocationValidator,
		getLocationById
	);
	router.post(
		"/locations",
		authenticatedMiddleware,
		roleMiddleware("admin", "manager"),
		createLocationValidator,
		createLocation
	);
	router.patch(
		"/locations/:id",
		authenticatedMiddleware,
		roleMiddleware("admin", "manager"),
		updateLocationValidator,
		updateLocation
	);
	router.delete(
		"/locations/:id",
		authenticatedMiddleware,
		roleMiddleware("admin", "manager"),
		deleteLocationValidator,
		deleteLocation
	);
};
