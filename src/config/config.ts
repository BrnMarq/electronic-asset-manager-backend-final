const ssl = process.env.DB_SSL === 'true' ? { ssl: { require: true, rejectUnauthorized: false } } : undefined;

export = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: ssl,
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: ssl,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: ssl,
  },
};
