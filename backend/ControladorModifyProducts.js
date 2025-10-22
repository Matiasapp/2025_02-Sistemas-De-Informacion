import { pool } from "./db.js";

// ✅ Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category_ID, brand_id } = req.body;

    await pool.query(
      "UPDATE products SET name = ?, description = ?, category_ID = ?, brand_id = ? WHERE product_ID = ?",
      [name, description, category_ID, brand_id, id]
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

const handleSaveWithImages = async () => {
  if (!selectedProduct) return;

  try {
    // 1️⃣ Actualizar producto
    await fetch(
      `http://localhost:3000/products/${selectedProduct.product_ID}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedProduct.name,
          description: selectedProduct.description,
          category_ID: selectedProduct.category_ID,
          brand_id: selectedProduct.brand_id,
        }),
      }
    );

    // 2️⃣ Actualizar variantes
    for (const v of selectedProduct.variants) {
      await fetch(`http://localhost:3000/variants/${v.variant_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
    }

    // 3️⃣ Subir imágenes nuevas
    for (const img of newVariantImages) {
      const formData = new FormData();
      formData.append("image", img.file);
      formData.append("color_ID", img.color_ID.toString());
      formData.append("product_ID", selectedProduct.product_ID.toString());

      await fetch(
        `http://localhost:3000/variants/${selectedProduct.product_ID}/images`,
        {
          method: "POST",
          body: formData,
        }
      );
    }

    alert("Producto, variantes e imágenes actualizadas correctamente");
    setSelectedProduct(null);
    setNewVariantImages([]);
  } catch (err) {
    console.error(err);
    alert("Error al guardar cambios");
  }
};

//  Actualizar variante
export const updateVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { color_ID, size, price, stock, sku } = req.body;
    console.log("Datos recibidos para actualizar variante:", req.body);

    if (!color_ID || !size || price == null || stock == null || !sku) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await pool.query(
      `UPDATE product_variants
       SET color_ID = ?, size = ?, price = ?, stock = ?, sku = ?
       WHERE variant_id = ?`,
      [
        Number(color_ID),
        size,
        Number(price),
        Number(stock),
        sku,
        Number(variant_id),
      ]
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
