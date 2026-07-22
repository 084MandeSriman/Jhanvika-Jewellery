import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRootPool } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = process.argv[2] || "migration_001.sql";

async function run() {
  const pool = createRootPool();
  const sql = fs.readFileSync(path.join(__dirname, file), "utf-8");
  try {
    console.log(`Applying ${file} ...`);
    const conn = await pool.getConnection();
    await conn.query(`USE ${process.env.DB_NAME || "jhanvika_jewelleries"};`);
    await conn.query(sql);
    conn.release();
    console.log("✅ Migration applied successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}
run();
