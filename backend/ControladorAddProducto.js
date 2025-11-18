import { pool } from "./db.js";

const addProductController = async (req, res) => {
  try {
    const {
      name,
      description,
      category_ID,
      brand_id,
      supplier_ID,
      main_color_ID,
    } = req.body;

    // Insertar producto
    const [productResult] = await pool.query(
      "INSERT INTO products (name, description, category_ID, brand_id, supplier_ID,main_color_ID) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, category_ID, brand_id, supplier_ID, main_color_ID]
    );
    const product_ID = productResult.insertId;

    // Insertar variantes
    const variants = req.body.variants; // array de variantes JSON

    for (let i = 0; i < variants.length; i++) {
      const v = JSON.parse(variants[i]);

      // Insertar variante
      const [variantResult] = await pool.query(
        `INSERT INTO product_variants 
          (product_ID, color_ID, size, price, stock, sku)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [product_ID, v.color_ID, v.size, v.price, v.stock, v.sku]
      );

      // Subir imágenes correspondientes a esta variante
      const variantFiles = req.files.filter(
        (file) => file.fieldname === `variantImages[${i}]`
      );

      // Asegúrate de que la variante tenga un mainImageIndex válido
      const mainImageIndex = v.mainImageIndex; // Indice de la imagen principal

      // Iterar sobre las imágenes de la variante
      for (let idx = 0; idx < variantFiles.length; idx++) {
        const file = variantFiles[idx];

        // Determinar si la imagen es la principal
        const isMain = idx === mainImageIndex;

        // Insertar imagen en la base de datos
        await pool.query(
          `INSERT INTO product_images 
            (product_ID, color_ID, image_url, is_main)
           VALUES (?, ?, ?, ?)`,
          [
            product_ID,
            v.color_ID,
            file.path.replace(/\\/g, "/"), // Cambiar \ por /
            isMain ? 1 : 0, // Si la imagen es principal, es 1, de lo contrario 0
          ]
        );
      }
    }

    res.json({
      message: "Producto con variantes e imágenes creado correctamente",
    });
  } catch (err) {
    res.status(500).json({ error: "Error al crear producto" });
  }
};

export { addProductController };
