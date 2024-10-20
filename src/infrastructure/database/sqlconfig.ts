import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    dialect: "mysql",
    logging: console.log, 
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("Connection to database ok");

  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
}

testConnection();

export default sequelize;
