import { checkSchema, ParamSchema } from "express-validator";

const id: ParamSchema = {
	in: ["params"],
	isInt: {
		errorMessage: "ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "ID is required.",
	},
};

export const getTypeValidator = checkSchema({
	id,
});

export const createTypeValidator = checkSchema({
	name: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Name is required.",
		},
	},
	category: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Category is required.",
		},
	},
	description: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
});

export const updateTypeValidator = checkSchema({
	id,
	name: {
		in: ["body"],
		isString: true,
		trim: true,
		optional: true,
	},
	category: {
		in: ["body"],
		isString: true,
		trim: true,
		optional: true,
	},
	description: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
});

export const deleteTypeValidator = checkSchema({
	id,
});
