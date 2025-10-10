import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "localhost",
  user: "root",
  password: "passwordmati",
  port: 3306,
  database: "bd_ventaropa",
});
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado correctamente a la base de datos");
    connection.release();
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
  }
})();
