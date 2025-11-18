import { pool } from "./db.js";

export const getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
SELECT 
  p.product_ID,
  p.name AS product_name,
  p.description,
  p.main_color_ID,
  p.gender,
  c.name AS category_name,
  b.name AS brand_name,
  (
    SELECT i.image_url
    FROM product_images i
    WHERE i.product_id = p.product_ID 
      AND i.is_main = 1 
      AND p.main_color_ID = i.color_ID
    LIMIT 1
  ) AS main_image,
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'variant_ID', v.variant_ID,
      'color_ID', v.color_ID,
      'size', v.size,
      'price', v.price,
      'stock', v.stock
    )
  ) AS variants,
  MIN(v.price) AS min_price,
  MAX(v.price) AS max_price
FROM products p
LEFT JOIN categories c ON c.category_ID = p.category_ID
LEFT JOIN brands b ON b.brand_ID = p.brand_id
LEFT JOIN product_variants v 
       ON v.product_id = p.product_ID
      AND v.stock > 0
      AND v.is_active = 1
WHERE p.is_active = 1
GROUP BY 
  p.product_ID, 
  p.name, 
  p.description, 
  p.main_color_ID,
  p.gender,
  c.name, 
  b.name
ORDER BY p.total_sales DESC, p.created_at DESC;
      `
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todos los productos" });
  }
};
