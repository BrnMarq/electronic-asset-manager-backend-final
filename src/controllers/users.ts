import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { User } from "../models/User";
import Role from "../models/Role";
import Asset from "../models/Asset";
import { random, hashPassword } from "../utils/hasher";

const userInclude = {
	include: [
		{
			model: Role,
			attributes: ["id", "name"],
		},
	],
};

export const getUsers = async (_: Request, res: Response) => {
	try {
		const users = await User.findAll(userInclude);
		res.status(200).json(users);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const getUserById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const createUser = async (req: Request, res: Response) => {
	try {
		const { username, email, password, first_name, last_name, role_id } =
			req.body;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const salt = random();
		const user = await User.create({
			username,
			email,
			first_name,
			last_name,
			role_id,
			salt,
			hashed_password: hashPassword(salt, password),
		});
		await user.reload(userInclude);
		res
			.status(201)
			.json({ user: user.toJSON(), message: "User created successfully" });
	} catch (error) {
		res.status(500).json({ message: "Internal server error" });
		console.error(error);
	}
};

export const updateUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { username, email, first_name, last_name, role_id } = req.body;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const user = await User.findByPk(id, userInclude);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.username = username ?? user.username;
		user.email = email ?? user.email;
		user.first_name = first_name ?? user.first_name;
		user.last_name = last_name ?? user.last_name;
		user.role_id = role_id ?? user.role_id;

		await user.save();

		await user.reload(userInclude);

		res.status(200).json({ user, message: "User updated successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const associatedAssets = await Asset.count({
			where: { responsible_id: id },
		});
		if (associatedAssets > 0) {
			return res.status(400).json({
				message:
					"No se puede eliminar el usuario porque es responsable de activos.",
			});
		}

		await user.destroy();
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
