import { pool } from "./db.js";
import { sendLowStockAlert } from "./services/EmailService.js";

const LOW_STOCK_THRESHOLD = 3; // Umbral de stock bajo

// Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      category_ID,
      brand_id,
      supplier_ID,
      main_color_ID,
      gender,
    } = req.body;

    // Actualizar datos básicos del producto
    await pool.query(
      "UPDATE products SET name = ?, description = ?, category_ID = ?, brand_id = ?, supplier_ID = ?, main_color_ID = ?, gender = ? WHERE product_ID = ?",
      [
        name,
        description,
        category_ID || null,
        brand_id || null,
        supplier_ID || null,
        main_color_ID || null,
        gender || null,
        id,
      ]
    );

    // Procesar variantes (crear nuevas o actualizar existentes)
    let variantsData = [];

    // Extraer datos de variantes del req.body
    // Multer puede parsear las variantes como array o como claves planas
    if (req.body.variants && Array.isArray(req.body.variants)) {
      // Formato parseado: req.body.variants = [{color_ID: "3", size: "S", ...}, ...]

      variantsData = req.body.variants.map((v) => ({
        variant_id: v.variant_id || null,
        color_ID: v.color_ID,
        size: v.size,
        price: v.price,
        stock: v.stock,
        sku: v.sku,
        is_active:
          v.is_active === "true" ||
          v.is_active === "1" ||
          v.is_active === true ||
          v.is_active === 1
            ? 1
            : 0,
      }));
    } else {
      // Formato plano: req.body['variants[0][color_ID]'] = "3"

      for (let i = 0; ; i++) {
        const variantIdKey = `variants[${i}][variant_id]`;
        const colorKey = `variants[${i}][color_ID]`;
        const sizeKey = `variants[${i}][size]`;
        const priceKey = `variants[${i}][price]`;
        const stockKey = `variants[${i}][stock]`;
        const skuKey = `variants[${i}][sku]`;
        const isActiveKey = `variants[${i}][is_active]`;

        if (!req.body[colorKey]) break; // No hay más variantes

        variantsData.push({
          variant_id: req.body[variantIdKey] || null,
          color_ID: req.body[colorKey],
          size: req.body[sizeKey],
          price: req.body[priceKey],
          stock: req.body[stockKey],
          sku: req.body[skuKey],
          is_active:
            req.body[isActiveKey] === "true" || req.body[isActiveKey] === "1"
              ? 1
              : 0,
        });
      }
    }

    // Obtener variantes existentes para este producto
    const [existingVariants] = await pool.query(
      "SELECT variant_id, color_ID, size, sku, price, stock, is_active FROM product_variants WHERE product_ID = ?",
      [id]
    );

    // Rastrear qué variantes se procesaron para poder eliminar las que no están
    const processedVariantIds = [];

    // Procesar cada variante recibida (crear o actualizar)
    for (const variantData of variantsData) {
      // Si tiene variant_id, usarlo directamente para actualizar
      // Si no, buscar por color_ID y size (para compatibilidad con creación)
      let existing = null;

      if (variantData.variant_id) {
        // Buscar por variant_id si está disponible (convertir ambos a número para comparar)
        const variantIdToFind = parseInt(variantData.variant_id);
        existing = existingVariants.find(
          (v) => v.variant_id === variantIdToFind
        );
      } else {
        // Buscar por color y talla (para variantes nuevas)
        existing = existingVariants.find(
          (v) =>
            v.color_ID === parseInt(variantData.color_ID) &&
            v.size === variantData.size
        );
      }

      if (existing) {
        // Actualizar variante existente solo si hay cambios
        const hasChanges =
          existing.color_ID !== Number(variantData.color_ID) ||
          existing.size !== variantData.size ||
          existing.price !== Number(variantData.price) ||
          existing.stock !== Number(variantData.stock) ||
          existing.sku !== variantData.sku ||
          existing.is_active !== variantData.is_active;

        if (hasChanges) {
          await pool.query(
            `UPDATE product_variants 
             SET color_ID = ?, size = ?, price = ?, stock = ?, sku = ?, is_active = ?
             WHERE variant_id = ?`,
            [
              Number(variantData.color_ID),
              variantData.size,
              Number(variantData.price),
              Number(variantData.stock),
              variantData.sku,
              variantData.is_active,
              existing.variant_id,
            ]
          );
        }
        processedVariantIds.push(existing.variant_id);
      } else {
        // Crear nueva variante
        const [result] = await pool.query(
          `INSERT INTO product_variants 
            (product_ID, color_ID, size, price, stock, sku, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            Number(variantData.color_ID),
            variantData.size,
            Number(variantData.price),
            Number(variantData.stock),
            variantData.sku,
            variantData.is_active,
          ]
        );
        processedVariantIds.push(result.insertId);
      }
    }

    // Eliminar variantes que ya no están en la lista recibida
    const variantsToDelete = existingVariants.filter(
      (v) => !processedVariantIds.includes(v.variant_id)
    );

    for (const variantToDelete of variantsToDelete) {
      await pool.query("DELETE FROM product_variants WHERE variant_id = ?", [
        variantToDelete.variant_id,
      ]);
    }

    // 3. Procesar imágenes subidas (si existen)
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Parsear nombres de campos para extraer índice de variante
        // Formato esperado: variants[0][images][0], variants[1][images][0], etc.
        const match = file.fieldname.match(
          /variants\[(\d+)\]\[images\]\[\d+\]/
        );
        if (match) {
          const variantIndex = parseInt(match[1]);

          // Buscar color_ID en req.body - probar diferentes formatos
          let color_id = null;

          // Formato 1: req.body['variants[0][color_ID]']
          const flatKey = `variants[${variantIndex}][color_ID]`;
          if (req.body[flatKey]) {
            color_id = req.body[flatKey];
          }
          // Formato 2: req.body.variants[0].color_ID (si está parseado como objeto)
          else if (
            req.body.variants &&
            Array.isArray(req.body.variants) &&
            req.body.variants[variantIndex]
          ) {
            color_id = req.body.variants[variantIndex].color_ID;
          }
          // Formato 3: req.body.variants como objeto con índices como keys
          else if (req.body.variants && req.body.variants[variantIndex]) {
            color_id = req.body.variants[variantIndex].color_ID;
          }

          if (color_id) {
            const image_url = `../frontend/public/uploads/${file.filename}`;

            // Verificar si ya existe esta imagen para evitar duplicados
            const [[existing]] = await pool.query(
              "SELECT image_id FROM product_images WHERE product_id = ? AND color_id = ? AND image_url = ?",
              [id, color_id, image_url]
            );

            if (existing) {
              continue; // Ya existe, no la insertes de nuevo
            }

            // Insertar imagen en la BD
            const [result] = await pool.query(
              "INSERT INTO product_images (product_id, color_id, image_url, is_main) VALUES (?, ?, ?, ?)",
              [id, color_id, image_url, 0]
            );
          }
        }
      }
    } else {
    }

    // Verificar stock bajo y enviar alerta si es necesario
    try {
      const [lowStockVariants] = await pool.query(
        `SELECT 
          pv.variant_id, pv.stock, pv.size,
          p.name as product_name,
          c.name as color_name,
          s.name as supplier_name,
          s.phone as supplier_phone
         FROM product_variants pv
         INNER JOIN products p ON pv.product_ID = p.product_ID
         LEFT JOIN colors c ON pv.color_ID = c.color_ID
         LEFT JOIN suppliers s ON p.supplier_ID = s.supplier_ID
         WHERE pv.product_ID = ? AND pv.stock <= ? AND pv.is_active = 1`,
        [id, LOW_STOCK_THRESHOLD]
      );

      if (lowStockVariants.length > 0) {
        await sendLowStockAlert(lowStockVariants);
      }
    } catch (emailError) {
      // No fallar la actualización si el email falla
    }

    res.json({
      success: true,
      message: "Producto actualizado correctamente",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error al actualizar producto", details: err.message });
  }
};

//  Actualizar variante
export const updateVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { color_ID, size, price, stock, sku, is_active } = req.body;

    if (!color_ID || !size || price == null || stock == null || !sku) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    await pool.query(
      `UPDATE product_variants
       SET color_ID = ?, size = ?, price = ?, stock = ?, sku = ?, is_active = ?
       WHERE variant_id = ?`,
      [
        Number(color_ID),
        size,
        Number(price),
        Number(stock),
        sku,
        is_active ?? 1,
        Number(variant_id),
      ]
    );

    res.json({
      success: true,
      message: "Variante actualizada correctamente",
    });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar variante" });
  }
};

export const SwitchActiveProduct = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    await pool.query("UPDATE products SET is_active = ? WHERE product_ID = ?", [
      is_active,
      id,
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar estado del producto" });
  }
};

export const SwitchActiveVariant = async (req, res) => {
  const variant_id = req.params.id;
  const { is_active } = req.body;

  try {
    // Actualizamos estado de la variante
    await pool.query(
      "UPDATE product_variants SET is_active = ? WHERE variant_id = ?",
      [is_active, variant_id]
    );

    // Obtenemos el product_id al que pertenece
    const [[variant]] = await pool.query(
      "SELECT product_id FROM product_variants WHERE variant_id = ?",
      [variant_id]
    );

    if (!variant)
      return res.status(404).json({ message: "Variante no encontrada" });

    const product_id = variant.product_id;

    // Revisamos si existen variantes activas
    const [[{ active_count }]] = await pool.query(
      "SELECT COUNT(*) AS active_count FROM product_variants WHERE product_id = ? AND is_active = 1",
      [product_id]
    );

    // Si ninguna variante está activa, desactivar el producto
    //    Si hay al menos una activa, activar el producto

    const newProductState = active_count > 0 ? 1 : 0;
    if (newProductState === 0) {
      res.json({
        message: "Al desactivar la variante, también se desactivó el producto",
      });
    }

    await pool.query("UPDATE products SET is_active = ? WHERE product_id = ?", [
      newProductState,
      product_id,
    ]);

    res.json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado" });
  }
};

export const addVariantController = async (req, res) => {
  try {
    const { product_ID, color_ID, size, price, stock, sku, is_active } =
      req.body;

    const [result] = await pool.query(
      `INSERT INTO product_variants 
        (product_ID, color_ID, size, price, stock, sku, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [product_ID, color_ID, size, price, stock, sku, is_active ?? 1]
    );

    res.json({ message: "Variante creada", variant_ID: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Error al crear variante" });
  }
};

export const deleteVariantController = async (req, res) => {
  const { variant_id } = req.params; // variant_id a eliminar
  try {
    // Eliminar la variante
    const [result] = await pool.query(
      "DELETE FROM product_variants WHERE variant_id = ?",
      [variant_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    res.json({ message: "Variante eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar variante" });
  }
};

export const updateimageMain = async (req, res) => {
  try {
    const { image_id, is_main } = req.body; // nuevo valor para is_main con la imagen específica

    // Si is_main es true, primero ponemos is_main = 0 para todas las imágenes del mismo producto y color
    if (is_main) {
      const [[image]] = await pool.query(
        "SELECT product_id, color_id FROM product_images WHERE image_id = ?",
        [image_id]
      );
      if (!image) {
        return res.status(404).json({ message: "Imagen no encontrada" });
      }

      const { product_id, color_id } = image;
      await pool.query(
        "UPDATE product_images SET is_main = 0 WHERE product_id = ? AND color_id= ?",
        [product_id, color_id]
      );
    }
    // Luego, actualizamos la imagen específica
    await pool.query(
      "UPDATE product_images SET is_main = ? WHERE image_id = ?",
      [is_main ? 1 : 0, image_id]
    );
    res.json({ message: "Imagen actualizada correctamente" });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar imagen" });
  }
};

export const EliminarImagenesPorColor = async (req, res) => {
  try {
    const { product_id, color_id } = req.body;

    if (!product_id || !color_id) {
      return res.status(400).json({ message: "Faltan parámetros" });
    }

    await pool.query(
      "DELETE FROM product_images WHERE product_id = ? AND color_id = ?",
      [product_id, color_id]
    );

    res.json({ message: "Imágenes eliminadas correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar imágenes" });
  }
};

export const deleteImageById = async (req, res) => {
  import("fs").then((fs) => {
    import("path").then((path) => {
      import("url").then((url) => {
        (async () => {
          try {
            const { id } = req.params;

            // Fetch image details from DB before deleting
            const [[image]] = await pool.query(
              "SELECT image_url FROM product_images WHERE image_id = ?",
              [id]
            );

            if (!image) {
              return res.status(404).json({ message: "Imagen no encontrada" });
            }

            // Delete from DB
            await pool.query("DELETE FROM product_images WHERE image_id = ?", [
              id,
            ]);

            // Attempt to delete physical file
            if (image.image_url) {
              const relativePath = image.image_url
                .replace("../frontend/public/", "")
                .replace(/^\.\/+/, "");
              const __filename = url.fileURLToPath(import.meta.url);
              const __dirname = path.dirname(__filename);
              const filePath = path.join(
                __dirname,
                "../frontend/public",
                relativePath
              );

              fs.unlink(filePath, (err) => {
                // Silently fail if file cannot be deleted
              });
            }

            res.json({
              success: true,
              message: "Imagen eliminada correctamente",
            });
          } catch (err) {
            res.status(500).json({ message: "Error al eliminar imagen" });
          }
        })();
      });
    });
  });
};
