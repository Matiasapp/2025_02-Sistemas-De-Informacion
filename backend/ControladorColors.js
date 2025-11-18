import { pool } from "./db.js";
export const ObtenerColors = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM colors");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener colores" });
  }
};

export const InsertarColors = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre del color es requerido" });
    }

    const [result] = await pool.query("INSERT INTO colors (name) VALUES (?)", [
      name.trim(),
    ]);

    res.status(201).json({
      success: true,
      message: "Color creado correctamente",
      color: {
        color_ID: result.insertId,
        name: name.trim(),
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Ya existe un color con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al crear el color" });
    }
  }
};

export const ActualizarColors = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre del color es requerido" });
    }

    const [result] = await pool.query(
      "UPDATE colors SET name = ? WHERE color_ID = ?",
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Color no encontrado" });
    }

    res.json({
      success: true,
      message: "Color actualizado correctamente",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Ya existe un color con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al actualizar el color" });
    }
  }
};

export const EliminarColors = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay variantes usando este color
    const [variantsUsingColor] = await pool.query(
      "SELECT COUNT(*) as count FROM product_variants WHERE color_ID = ?",
      [id]
    );

    if (variantsUsingColor[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar el color porque está siendo usada por ${variantsUsingColor[0].count} variante(s)`,
      });
    }

    const [result] = await pool.query("DELETE FROM colors WHERE color_ID = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Color no encontrado" });
    }

    res.json({
      success: true,
      message: "Color eliminado correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el color" });
  }
};
