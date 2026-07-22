import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRootPool } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const pool = createRootPool();
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  try {
    console.log("Connecting to MySQL and applying schema.sql ...");
    const conn = await pool.getConnection();
    await conn.query(sql);
    conn.release();
    console.log("✅ Schema applied successfully. Database 'jhanvika_jewelleries' is ready.");
  } catch (err) {
    console.error("❌ Failed to apply schema:", err.message);
    console.error("Check that DB_USER / DB_PASSWORD in your .env match your MySQL Workbench login.");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

run();
