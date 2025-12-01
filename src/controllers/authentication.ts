import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { hashPassword } from "../utils/hasher";
import { User } from "../models/User";
import Role from "../models/Role";
import config from "../config";

export const login = async (req: express.Request, res: express.Response) => {
	try {
		const { username, password } = req.body;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const db_user = await User.findOne({
			where: { username },
			include: [Role],
		});
		if (!db_user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}

		const user = db_user.toJSON();
		const hashedInputPassword = hashPassword(user.salt, password);
		if (hashedInputPassword !== user.hashed_password) {
			return res.status(403).json({ message: "Invalid credentials" });
		}

		const responseUser = {
			id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			username: user.username,
			email: user.email,
			role: {
                id: user.role.id,
                name: user.role.name
            },
		};

		const token = jwt.sign(responseUser, config.jwtSecret, {
			expiresIn: "1h",
		});

		res.status(200).json({ token });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};
