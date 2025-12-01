import { checkSchema, ParamSchema } from "express-validator";
import { User } from "../models/User";
import { Role } from "../models/Role";

const id: ParamSchema = {
	in: ["params"],
	isInt: {
		errorMessage: "ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "ID is required.",
	},
};

export const getUserValidator = checkSchema({
	id,
});

const checkUserExistenceWithField = async (field: string, value: string) => {
	const existingUser = await User.findOne({ where: { [field]: value } });
	if (existingUser) {
		throw new Error(`${field} already in use`);
	}
};

const checkRoleExistence = async (value: number) => {
	const existingRole = await Role.findByPk(value);
	if (!existingRole) {
		throw new Error("Role does not exist");
	}
};

export const createUserValidator = checkSchema({
	username: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Username is required",
		},
		custom: { options: checkUserExistenceWithField.bind(null, "username") },
	},
	email: {
		in: ["body"],
		isEmail: {
			errorMessage: "Valid email is required",
		},
		normalizeEmail: true,
		notEmpty: {
			errorMessage: "Email is required",
		},
		custom: { options: checkUserExistenceWithField.bind(null, "email") },
	},
	password: {
		in: ["body"],
		isString: true,
		isLength: {
			options: { min: 8 },
			errorMessage: "Password must be at least 8 characters",
		},
		notEmpty: {
			errorMessage: "Password is required",
		},
	},
	role_id: {
		in: ["body"],
		isInt: {
			options: { min: 1 },
			errorMessage: "role_id must be a valid integer",
		},
		notEmpty: {
			errorMessage: "role_id is required",
		},
		custom: { options: checkRoleExistence },
	},
	first_name: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "First name is required",
		},
	},
	last_name: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Last name is required",
		},
	},
});

export const updateUserValidator = checkSchema({
	username: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
	email: {
		in: ["body"],
		isEmail: {
			errorMessage: "Valid email is required.",
		},
		optional: true,
		normalizeEmail: true,
	},
	first_name: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
	last_name: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
});

export const deleteUserValidator = checkSchema({
	id,
});
