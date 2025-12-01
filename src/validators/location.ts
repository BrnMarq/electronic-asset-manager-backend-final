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

export const getLocationValidator = checkSchema({
	id,
});

export const createLocationValidator = checkSchema({
	name: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Name is required.",
		},
	},
	description: {
		in: ["body"],
		isString: true,
		optional: true,
		trim: true,
	},
});

export const updateLocationValidator = checkSchema({
	id,
	name: {
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

export const deleteLocationValidator = checkSchema({
	id,
});
