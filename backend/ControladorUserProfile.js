import { pool } from "./db.js";
import bcrypt from "bcrypt";

// Obtener perfil de usuario por ID
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT user_ID, firstname, lastname, email, phone, address, region, comuna, postal_code, created_at FROM users WHERE user_ID = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener perfil de usuario" });
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, phone, address, region, comuna, postal_code } =
      req.body;

    const [result] = await pool.query(
      `UPDATE users 
       SET firstname = ?, lastname = ?, phone = ?, address = ?, region = ?, comuna = ?, postal_code = ? 
       WHERE user_ID = ?`,
      [firstname, lastname, phone, address, region, comuna, postal_code, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolver datos actualizados
    const [rows] = await pool.query(
      "SELECT user_ID, firstname, lastname, email, phone, address, region, comuna, postal_code, created_at FROM users WHERE user_ID = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { user_ID, currentPassword, newPassword } = req.body;

    if (!user_ID || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    // Verificar contraseña actual
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE user_ID = ?",
      [user_ID]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!isValid) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    // Hash nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await pool.query("UPDATE users SET password = ? WHERE user_ID = ?", [
      hashedPassword,
      user_ID,
    ]);

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar contraseña" });
  }
};
