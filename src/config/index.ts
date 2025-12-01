const config = {
	port: process.env.PORT || 3000,
	database: {
		url: process.env.DATABASE_URL,
	},
	jwtSecret: process.env.JWT_SECRET,
	nodeEnv: process.env.NODE_ENV || "development",
};

export default config;
