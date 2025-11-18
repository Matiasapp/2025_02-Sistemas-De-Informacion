import { pool } from "./db.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

// Configurar el transportador de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Generar código de 6 dígitos
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Solicitar recuperación de contraseña (enviar código)
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email es requerido" });
    }

    // Verificar que el email existe
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        message: "Si el email existe, recibirás un código de verificación",
      });
    }

    // Generar código de 6 dígitos
    const code = generateCode();

    // Establecer expiración (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Eliminar códigos anteriores del mismo email
    await pool.query("DELETE FROM password_reset_codes WHERE email = ?", [
      email,
    ]);

    // Guardar código en la base de datos
    await pool.query(
      "INSERT INTO password_reset_codes (email, code, expires_at) VALUES (?, ?, ?)",
      [email, code, expiresAt]
    );

    // Enviar email con el código
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Código de Recuperación de Contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #1f2937; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p><strong>Este código expira en 15 minutos.</strong></p>
          <p>Si no solicitaste este código, ignora este mensaje.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message: "Si el email existe, recibirás un código de verificación",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la solicitud" });
  }
};

// Restablecer contraseña con código
export const resetPasswordWithCode = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Buscar código válido
    const [codes] = await pool.query(
      `SELECT * FROM password_reset_codes 
       WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (codes.length === 0) {
      return res.status(400).json({
        message: "Código inválido o expirado",
      });
    }

    // Verificar que el usuario existe
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    // Marcar código como usado
    await pool.query(
      "UPDATE password_reset_codes SET used = TRUE WHERE id = ?",
      [codes[0].id]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer contraseña" });
  }
};

// Verificar si un código es válido (opcional, para UX)
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const [codes] = await pool.query(
      `SELECT * FROM password_reset_codes 
       WHERE email = ? AND code = ? AND used = FALSE AND expires_at > NOW()`,
      [email, code]
    );

    if (codes.length === 0) {
      return res.status(400).json({ valid: false });
    }

    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ valid: false });
  }
};
