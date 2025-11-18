import { pool } from "./db.js";
export const ObtenerUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        u.user_ID,
        u.rut,
        u.email,
        u.firstname,
        u.lastname,
        u.phone,
        u.created_at,
        ut.type_ID,
        ut.type_name
      FROM users u
      LEFT JOIN user_types ut ON u.type_ID = ut.type_ID
    `;
    const params = [];

    if (search && search.trim() !== "") {
      query += ` WHERE 
        u.email LIKE ? OR 
        u.firstname LIKE ? OR 
        u.lastname LIKE ? OR 
        u.rut LIKE ? OR
        u.phone LIKE ?
      `;
      const searchPattern = `%${search.trim()}%`;
      params.push(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern
      );
    }

    query += " ORDER BY u.created_at DESC";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const ModificarTipoUsuario = async (req, res) => {
  const { id } = req.params;
  const { newTypeId } = req.body; // ej: 1 = cliente, 2 = administrador

  try {
    await pool.query("UPDATE users SET type_ID = ? WHERE user_ID = ?", [
      newTypeId,
      id,
    ]);
    res.json({ message: "Rol actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el rol" });
  }
};

export const EliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay órdenes asociadas a este usuario
    const [ordersUsingUser] = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE user_ID = ?",
      [id]
    );

    if (ordersUsingUser[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el usuario porque tiene ${ordersUsingUser[0].count} orden(es) asociada(s)`,
      });
    }

    // Verificar si hay carritos asociados
    const [cartsUsingUser] = await pool.query(
      "SELECT COUNT(*) as count FROM cart WHERE user_ID = ?",
      [id]
    );

    if (cartsUsingUser[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el usuario porque tiene ${cartsUsingUser[0].count} carrito(s) asociado(s)`,
      });
    }

    const [result] = await pool.query("DELETE FROM users WHERE user_ID = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      success: true,
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};
