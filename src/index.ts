import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import sequelize from "./config/database";
import config from "./config";
import router from "./router";

const app = express();

app.use(
	cors({
		origin: "https://electronic-asset-manager-frontend-f.vercel.app/", // Replace with your Vercel frontend domain
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true,
	})
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(router());

const startServer = async () => {
	try {
		await sequelize.sync({ alter: true });
		app.listen(config.port, () => {
			console.log(`Server is running on port http://localhost:${config.port}`);
		});
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

startServer();

export default app;
