import express from "express";
import authenticationRouter from "./authentication";
import assetRouter from "./assets";
import usersRouter from "./users";
import typeRouter from "./type";
import locationRouter from "./location";

const router = express.Router();

export default () => {
	usersRouter(router);
	authenticationRouter(router);
	assetRouter(router);
	typeRouter(router);
	locationRouter(router);
	router.get("/", (_, res) => {
		res.status(200).send("OK");
	});

	return router;
};
