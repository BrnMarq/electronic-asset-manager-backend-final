import express from "express";
import {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from "../controllers/users";
import {
	getUserValidator,
	createUserValidator,
	updateUserValidator,
	deleteUserValidator,
} from "../validators/users";
import { authenticatedMiddleware } from "../middlewares/authentication";
import { roleMiddleware } from "../middlewares/authorization";

export default (router: express.Router) => {
	router.get(
		"/users",
		authenticatedMiddleware,
		roleMiddleware("admin", "manager"),
		getUsers
	);
	router.get(
		"/users/:id",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		getUserValidator,
		getUserById
	);
	router.post(
		"/users",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		createUserValidator,
		createUser
	);
	router.patch(
		"/users/:id",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		updateUserValidator,
		updateUser
	);
	router.delete(
		"/users/:id",
		authenticatedMiddleware,
		roleMiddleware("admin"),
		deleteUserValidator,
		deleteUser
	);
};
