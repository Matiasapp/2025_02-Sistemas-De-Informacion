import { pool } from "./db.js";

// ✅ Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    await pool.query(
      "UPDATE products SET name = ?, description = ?, category_ID = ? WHERE product_id = ?",
      [name, description, category, id]
    );

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
    });
  } catch (err) {
    console.error("Error al actualizar producto:", err);
    res.status(500).json({ error: "Error al actualizar producto" });
  }
};

// ✅ Actualizar variante
export const updateVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { color_ID, size_ID, price, stock, sku } = req.body;

    // Asegurar que los numéricos se conviertan
    const numericValues = [color_ID, size_ID, price, stock].map(Number);

    await pool.query(
      `UPDATE product_variants
       SET color_ID = ?, size_ID = ?, price = ?, stock = ?, sku = ?
       WHERE variant_id = ?`,
      [...numericValues, sku, variant_id]
    );

    res.json({
      success: true,
      message: "Variante actualizada correctamente",
    });
  } catch (err) {
    console.error("Error al actualizar variante:", err);
    res.status(500).json({ error: "Error al actualizar variante" });
  }
};
