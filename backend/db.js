import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});
(async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    console.log("Conexión a la base de datos MySQL exitosa.");
  } catch (error) {
    // Error de conexión
  }
})();
