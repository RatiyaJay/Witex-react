'use strict';

require('dotenv').config();

const common = {
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: false,
};

function envConfig() {
  if (process.env.DATABASE_URL) {
    return { use_env_variable: 'DATABASE_URL', ...common };
  }
  return {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  };
}

module.exports = {
  development: envConfig(),
  production: envConfig(),
};
