import { pool } from "./db.js";

const addProductController = async (req, res) => {
  try {
    const { name, description, category_ID, brand_id } = req.body;

    // 1️⃣ Insertar producto
    const [productResult] = await pool.query(
      "INSERT INTO products (name, description, category_ID, brand_id) VALUES (?, ?, ?, ?)",
      [name, description, category_ID, brand_id]
    );
    const product_ID = productResult.insertId;

    // 2️⃣ Insertar variantes
    const variants = req.body.variants; // array de variantes JSON

    for (let i = 0; i < variants.length; i++) {
      const v = JSON.parse(variants[i]);

      // Verificar si ya hay una variante del mismo producto y color
      const [existing] = await pool.query(
        "SELECT variant_id FROM product_variants WHERE product_ID = ? AND color_ID = ?",
        [product_ID, v.color_ID]
      );

      let variant_ID;

      if (existing.length > 0 && (!v.images || v.images.length === 0)) {
        // ✅ Variante nueva solo cambia talla, precio, stock, sku
        const [variantResult] = await pool.query(
          "INSERT INTO product_variants (product_ID, color_ID, size, price, stock, sku) VALUES (?, ?, ?, ?, ?, ?)",
          [product_ID, v.color_ID, v.size, v.price, v.stock, v.sku]
        );
        variant_ID = variantResult.insertId;

        // No subimos imágenes, se usan las existentes para ese color
        // Nada que insertar en product_images
      } else {
        // ✅ Variante nueva con imágenes
        const [variantResult] = await pool.query(
          "INSERT INTO product_variants (product_ID, color_ID, size, price, stock, sku) VALUES (?, ?, ?, ?, ?, ?)",
          [product_ID, v.color_ID, v.size, v.price, v.stock, v.sku]
        );
        variant_ID = variantResult.insertId;

        // Subir imágenes de esta variante
        const variantFiles = req.files.filter(
          (file) => file.fieldname === `variantImages[${i}]`
        );

        for (let idx = 0; idx < variantFiles.length; idx++) {
          const file = variantFiles[idx];
          await pool.query(
            "INSERT INTO product_images (product_ID, color_ID, image_url, is_main) VALUES (?, ?, ?, ?)",
            [
              product_ID,
              v.color_ID,
              file.path.replace(/\\/g, "/"),
              idx === 0 ? 1 : 0,
            ]
          );
        }
      }
    }

    res.json({
      message: "Producto con variantes e imágenes creado correctamente",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear producto" });
  }
};

export { addProductController };
