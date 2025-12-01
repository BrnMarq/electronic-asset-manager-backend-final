import { checkSchema, ParamSchema } from "express-validator";
import Location from "../models/Location";
import { AssetStatus } from "../models/Asset";
import Type from "../models/Type";
import User from "../models/User";

const makeOptional: (schema: ParamSchema) => ParamSchema = (
	schema: ParamSchema
) => ({
	...schema,
	optional: { options: { nullable: true } },
});

const setIn: (
	schema: ParamSchema,
	locations: ParamSchema["in"]
) => ParamSchema = (
	schema: ParamSchema,
	locations: ParamSchema["in"] = ["query"]
): ParamSchema => ({
	...schema,
	in: locations,
});

const id: ParamSchema = {
	in: ["params"],
	isInt: {
		errorMessage: "ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "ID is required.",
	},
};

const name: ParamSchema = {
	in: ["body"],
	isString: {
		errorMessage: "Name must be a string.",
	},
	notEmpty: {
		errorMessage: "Name is required.",
	},
};

const serial_number: ParamSchema = {
	in: ["body"],
	isInt: {
		errorMessage: "Serial number must be an integer.",
	},
	notEmpty: {
		errorMessage: "Serial number is required.",
	},
};

const type_id: ParamSchema = {
	in: ["body"],
	isInt: {
		errorMessage: "Type ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "Type ID is required.",
	},
	custom: {
		options: async (value) => {
			const type = await Type.findByPk(value);
			if (!type) return Promise.reject("Type ID does not exist.");
		},
	},
};

const description: ParamSchema = {
	in: ["body"],
	isString: true,
	optional: { options: { nullable: true } },
};

const responsible_id: ParamSchema = {
	in: ["body"],
	isInt: {
		errorMessage: "Responsible ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "Responsible ID is required.",
	},
	custom: {
		options: async (value) => {
			const user = await User.findByPk(value);
			if (!user) return Promise.reject("Responsible ID does not exist.");
		},
	},
};

const location_id: ParamSchema = {
	in: ["body"],
	isInt: {
		errorMessage: "Location ID must be an integer.",
	},
	notEmpty: {
		errorMessage: "Location ID is required.",
	},
	custom: {
		options: async (value) => {
			const location = await Location.findByPk(value);
			if (!location) return Promise.reject("Location ID does not exist.");
		},
	},
};

const status: ParamSchema = {
	in: ["body"],
	isString: {
		errorMessage: "Status must be a string.",
	},
	notEmpty: {
		errorMessage: "Status is required.",
	},
	isIn: {
		options: [Object.values(AssetStatus)],
		errorMessage: `Status must be one of: ${Object.values(AssetStatus).join(
			", "
		)}`,
	},
};

const cost: ParamSchema = {
	in: ["body"],
	isFloat: {
		errorMessage: "Cost must be a number.",
	},
	notEmpty: {
		errorMessage: "Cost is required.",
	},
};

const acquisition_date: ParamSchema = {
	in: ["body"],
	isISO8601: {
		errorMessage: "Acquisition date must be a valid date.",
	},
	notEmpty: {
		errorMessage: "Acquisition date is required.",
	},
};

const change_reason: ParamSchema = {
	in: ["body"],
	isString: {
		errorMessage: "Change reason must be a string if provided.",
	},
	optional: { options: { nullable: true } },
};

export const getAssetsValidator = checkSchema({
	name: makeOptional(setIn(name, ["query"])),
	serial_number: makeOptional(setIn(serial_number, ["query"])),
	type_id: makeOptional(setIn(type_id, ["query"])),
	description: makeOptional(setIn(description, ["query"])),
	responsible_id: makeOptional(setIn(responsible_id, ["query"])),
	location_id: makeOptional(setIn(location_id, ["query"])),
	status: makeOptional(setIn(status, ["query"])),
	cost: makeOptional(setIn(cost, ["query"])),
	acquisition_date: makeOptional(setIn(acquisition_date, ["query"])),
	page: {
		in: ["query"],
		isInt: {
			errorMessage: "Page must be an integer.",
		},
		optional: { options: { nullable: true } },
	},
	limit: {
		in: ["query"],
		isInt: {
			errorMessage: "Limit must be an integer.",
		},
		optional: { options: { nullable: true } },
	},
});

export const getAssetChangelogValidator = checkSchema({
	id,
});

export const createAssetValidator = checkSchema({
	name,
	serial_number,
	type_id,
	description,
	responsible_id,
	location_id,
	status,
	cost,
	acquisition_date,
});

export const deleteAssetValidator = checkSchema({
	id,
	change_reason,
});

export const updateAssetValidator = checkSchema({
	name: makeOptional(name),
	serial_number: makeOptional(serial_number),
	type_id: makeOptional(type_id),
	description: makeOptional(description),
	responsible_id: makeOptional(responsible_id),
	location_id: makeOptional(location_id),
	status: makeOptional(status),
	cost: makeOptional(cost),
	acquisition_date: makeOptional(acquisition_date),
	change_reason,
});
