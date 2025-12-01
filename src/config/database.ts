import pg from "pg";
import { Sequelize } from "sequelize-typescript";
import config from ".";
import { User } from "../models/User";
import { Role } from "../models/Role";
import { Asset } from "../models/Asset";
import { Type } from "../models/Type";
import { Location } from "../models/Location";
import { ChangeLog } from "../models/ChangeLog";

const sequelize: Sequelize = new Sequelize(config.database.url, {
	dialect: "postgres",
	logging: false,
	define: {
		timestamps: true,
		underscored: true,
	},
	dialectModule: pg,
	models: [User, Role, Asset, Type, Location, ChangeLog],
});

const authenticate: () => Promise<void> = async () => {
	try {
		await sequelize.authenticate();
		console.log(
			"Connection to the database has been established successfully."
		);
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

authenticate();

export default sequelize;
