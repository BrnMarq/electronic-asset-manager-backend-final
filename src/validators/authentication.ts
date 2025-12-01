import { checkSchema } from "express-validator";

const loginValidator = checkSchema({
	username: {
		in: ["body"],
		isString: true,
		trim: true,
		notEmpty: {
			errorMessage: "Username is required",
		},
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
});

export { loginValidator };
