import { pool } from "./db.js";

export const searchProducts = async (req, res) => {
  try {
    const searchTerm = req.query.q;

    if (!searchTerm || searchTerm.trim() === "") {
      return res.json([]);
    }

    const searchPattern = `%${searchTerm}%`;

    const query = `
      SELECT 
        p.product_ID,
        p.name AS product_name,
        p.description,
        p.gender,
        c.name AS category_name,
        b.name AS brand_name,
        MIN(pv.price) AS min_price,
        MAX(pv.price) AS max_price,
        (
          SELECT pi.image_url 
          FROM product_images pi 
          WHERE pi.product_id = p.product_ID 
            AND pi.is_main = 1 
          LIMIT 1
        ) AS main_image
      FROM products p
      LEFT JOIN categories c ON p.category_ID = c.category_ID
      LEFT JOIN brands b ON p.brand_id = b.brand_id
      LEFT JOIN product_variants pv ON p.product_ID = pv.product_id
      WHERE p.is_active = 1
        AND (
          p.name LIKE ? 
          OR p.description LIKE ?
          OR b.name LIKE ?
          OR c.name LIKE ?
          or p.gender LIKE ?
        )
      GROUP BY p.product_ID, p.name, p.description, p.gender, c.name, b.name
      ORDER BY p.name;
    `;

    const [rows] = await pool.query(query, [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ]);

    // Obtener variantes para cada producto
    for (let product of rows) {
      const [variants] = await pool.query(
        `SELECT variant_ID, color_ID, size, price, stock 
         FROM product_variants 
         WHERE product_id = ? AND is_active = 1`,
        [product.product_ID]
      );
      product.variants = variants;
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al buscar productos" });
  }
};
