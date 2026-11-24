import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "";
const esLocal =
  connectionString.includes("localhost") ||
  connectionString.includes("127.0.0.1");

export const pool = new Pool({
  connectionString,
  ssl: esLocal ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Error inesperado en el pool de PostgreSQL:", err);
});
