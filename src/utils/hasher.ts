import crypto from "crypto";
import config from "../config";

export const random = (bytes = 128) =>
	crypto.randomBytes(bytes).toString("base64");

export const hashPassword = (salt: string, password: string) => {
	return crypto
		.createHmac("sha256", [salt, password].join("/"))
		.update(config.jwtSecret)
		.digest("hex");
};
