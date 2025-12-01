require("dotenv").config();
const { Sequelize } = require("sequelize");

const url = process.env.DATABASE_URL;
const sequelize = url
  ? new Sequelize(url, { logging: false })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT || "mysql",
        logging: false,
      }
    );

module.exports = sequelize;
