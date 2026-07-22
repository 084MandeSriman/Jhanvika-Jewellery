import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool connects WITHOUT selecting a database first (used only by runSchema.js
// to create the database if it doesn't exist yet).
export function createRootPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: true,
  });
}

// Main app pool, scoped to the jhanvika_jewelleries database.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "jhanvika_jewelleries",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

export default pool;
