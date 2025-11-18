import { pool } from "./db.js";

// Obtener métricas generales del dashboard
export const getDashboardMetrics = async (req, res) => {
  try {
    // Total de ventas
    const [totalSalesResult] = await pool.query(
      `SELECT 
         IFNULL(COUNT(DISTINCT o.order_ID), 0) as total_orders, 
         IFNULL(SUM(oi.quantity * oi.price), 0) as total_revenue
       FROM orders o
       LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
       WHERE o.status != 'cancelado'`
    );

    // Ventas del mes actual
    const [monthlySalesResult] = await pool.query(
      `SELECT 
         IFNULL(COUNT(DISTINCT o.order_ID), 0) as monthly_orders, 
         IFNULL(SUM(oi.quantity * oi.price), 0) as monthly_revenue
       FROM orders o
       LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
       WHERE MONTH(o.order_date) = MONTH(CURRENT_DATE())
         AND YEAR(o.order_date) = YEAR(CURRENT_DATE())
         AND o.status != 'cancelado'`
    );

    // Total de productos
    const [productsResult] = await pool.query(
      `SELECT IFNULL(COUNT(*), 0) as total_products FROM products`
    );

    // Total de usuarios
    const [usersResult] = await pool.query(
      `SELECT IFNULL(COUNT(*), 0) as total_users FROM users WHERE type_ID = 1`
    );

    // Pedidos pendientes
    const [pendingOrdersResult] = await pool.query(
      `SELECT IFNULL(COUNT(*), 0) as pending_orders 
       FROM orders 
       WHERE status = 'pendiente'`
    );

    // Stock bajo (menos de 10 unidades)
    const [lowStockResult] = await pool.query(
      `SELECT IFNULL(COUNT(*), 0) as low_stock_products 
       FROM product_variants 
       WHERE stock < 10`
    );

    res.json({
      totalOrders: parseInt(totalSalesResult[0].total_orders) || 0,
      totalRevenue: parseFloat(totalSalesResult[0].total_revenue) || 0,
      monthlyOrders: parseInt(monthlySalesResult[0].monthly_orders) || 0,
      monthlyRevenue: parseFloat(monthlySalesResult[0].monthly_revenue) || 0,
      totalProducts: parseInt(productsResult[0].total_products) || 0,
      totalUsers: parseInt(usersResult[0].total_users) || 0,
      pendingOrders: parseInt(pendingOrdersResult[0].pending_orders) || 0,
      lowStockProducts: parseInt(lowStockResult[0].low_stock_products) || 0,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener métricas del dashboard",
      error: error.message,
    });
  }
};

// Obtener productos más vendidos
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const [rows] = await pool.query(
      `SELECT 
         p.product_ID,
         p.name as product_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_ID AND is_main = 1 LIMIT 1) as product_image,
         IFNULL(b.name, 'Sin marca') as brand_name,
         IFNULL(SUM(oi.quantity), 0) as total_sold,
         IFNULL(SUM(oi.quantity * oi.price), 0) as total_revenue
       FROM order_items oi
       INNER JOIN product_variants pv ON oi.variant_id = pv.variant_id
       INNER JOIN products p ON pv.product_id = p.product_ID
       LEFT JOIN brands b ON p.brand_id = b.brand_id
       INNER JOIN orders o ON oi.order_ID = o.order_ID
       WHERE o.status != 'cancelado'
       GROUP BY p.product_ID
       ORDER BY total_sold DESC
       LIMIT ?`,
      [limit]
    );

    res.json(rows || []);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener productos más vendidos",
      error: error.message,
    });
  }
};

// Obtener ventas por período (últimos 7 días, 30 días, etc.)
export const getSalesByPeriod = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const [rows] = await pool.query(
      `SELECT 
         DATE(o.order_date) as date,
         IFNULL(COUNT(DISTINCT o.order_ID), 0) as orders_count,
         IFNULL(SUM(oi.quantity * oi.price), 0) as daily_revenue
       FROM orders o
       LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
       WHERE o.order_date >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY)
         AND o.status != 'cancelado'
       GROUP BY DATE(o.order_date)
       ORDER BY date ASC`,
      [days]
    );

    res.json(rows || []);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ventas por período",
      error: error.message,
    });
  }
};

// Obtener distribución de pedidos por estado
export const getOrdersByStatus = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM orders
       GROUP BY status
       ORDER BY count DESC`
    );

    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener distribución de pedidos" });
  }
};

// Obtener productos con stock bajo
export const getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;

    const [rows] = await pool.query(
      `SELECT 
         p.product_ID,
         p.name as product_name,
         (SELECT image_url FROM product_images WHERE product_id = p.product_ID AND is_main = 1 LIMIT 1) as product_image,
         IFNULL(b.name, 'Sin marca') as brand_name,
         IFNULL(s.name, 'Sin proveedor') as supplier_name,
         IFNULL(s.phone, 'N/A') as supplier_phone,
         pv.variant_id,
         IFNULL(pv.size, 'N/A') as size,
         IFNULL(c.name, 'Sin color') as color_name,
         pv.stock
       FROM product_variants pv
       INNER JOIN products p ON pv.product_id = p.product_ID
       LEFT JOIN brands b ON p.brand_id = b.brand_id
       LEFT JOIN colors c ON pv.color_ID = c.color_ID
       LEFT JOIN suppliers s ON p.supplier_ID = s.supplier_ID
       WHERE pv.stock < ?
       ORDER BY pv.stock ASC
       LIMIT 20`,
      [threshold]
    );

    res.json(rows || []);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener productos con stock bajo",
      error: error.message,
    });
  }
};

// Obtener ventas por región
export const getSalesByRegion = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         o.region,
         IFNULL(COUNT(DISTINCT o.order_ID), 0) as orders_count,
         IFNULL(SUM(oi.quantity * oi.price), 0) as total_revenue
       FROM orders o
       LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
       WHERE o.region IS NOT NULL
         AND o.status != 'cancelado'
       GROUP BY o.region
       ORDER BY total_revenue DESC`
    );

    res.json(rows || []);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener ventas por región",
      error: error.message,
    });
  }
};

// Obtener ingresos mensuales del año actual
export const getMonthlyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         MONTH(o.order_date) as month,
         MONTHNAME(o.order_date) as month_name,
         COUNT(DISTINCT o.order_ID) as orders_count,
         COALESCE(SUM(oi.quantity * oi.price), 0) as revenue
       FROM orders o
       LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
       WHERE YEAR(o.order_date) = YEAR(CURRENT_DATE())
         AND o.status != 'cancelado'
       GROUP BY MONTH(o.order_date), MONTHNAME(o.order_date)
       ORDER BY month ASC`
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener ingresos mensuales" });
  }
};
