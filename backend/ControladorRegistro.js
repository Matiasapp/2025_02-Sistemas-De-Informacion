import { pool } from "./db.js";
import bcrypt from "bcrypt";
import { sendWelcomeEmail } from "./services/EmailService.js";

export const registerUser = async (req, res) => {
  const { firstname, email, password, lastname, rut, phone } = req.body;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (!firstname || !email || !password || !lastname || !rut || !phone) {
    return res.status(400).json({ message: "Faltan datos" });
  }

  try {
    await pool.query(
      `INSERT INTO users (
        type_ID, rut, email, password, firstname, lastname, phone) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [1, rut, email, hashedPassword, firstname, lastname, phone]
    );

    // Enviar email de bienvenida
    try {
      await sendWelcomeEmail({
        userEmail: email,
        userName: `${firstname} ${lastname}`,
      });
    } catch (emailError) {
      // No fallar el registro si el email falla
    }

    res.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
