import { pool } from "./db.js";

export const ObtenerSupplier = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT 
        u.supplier_ID,
        u.email,
        u.name,
        u.phone,
        u.created_at
      FROM suppliers u
    `;
    const params = [];

    if (search && search.trim() !== "") {
      query += ` WHERE 
        u.email LIKE ? OR 
        u.name LIKE ? OR 
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
    res.status(500).json({ message: "Error al obtener proveedores" });
  }
};

export const AddSupplier = async (req, res) => {
  const { name, phone, email } = req.body;
  try {
    await pool.query(
      "INSERT INTO suppliers (name, phone, email) VALUES (?,?,?)",
      [name, phone, email]
    );
    res.status(201).json({ message: "Proveedor agregado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al añadir proveedor" });
  }
};

export const ModifySupplier = async (req, res) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;

  try {
    const [result] = await pool.query(
      "UPDATE suppliers SET name = ?, phone = ?, email = ? WHERE supplier_ID = ?",
      [name, phone, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({ message: "Proveedor actualizado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar el proveedor" });
  }
};

export const DeleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay productos asociadas a este usuario
    const [productsUsingSupplier] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE supplier_ID = ?",
      [id]
    );

    if (productsUsingSupplier[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el proveedor porque tiene ${ordersUsingUser[0].count} producto(s) asociado(s)`,
      });
    }

    const [result] = await pool.query(
      "DELETE FROM suppliers WHERE supplier_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Proveedor no encontrado" });
    }

    res.json({
      success: true,
      message: "Proveedor eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el Proveedor" });
  }
};
