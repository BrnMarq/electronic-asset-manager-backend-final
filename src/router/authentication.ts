import express from "express";

import { loginValidator } from "../validators/authentication";

import { login } from "../controllers/authentication";

export default (router: express.Router) => {
	router.post("/auth/login", loginValidator, login);
};
