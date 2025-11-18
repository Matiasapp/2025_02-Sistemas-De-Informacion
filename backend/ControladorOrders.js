import { pool } from "./db.js";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} from "./services/EmailService.js";

// Crear un nuevo pedido
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const userId = req.user.user_ID;
    const {
      items,
      total_price,
      paypal_order_id,
      street,
      region,
      commune,
      postal_code,
      notes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    await connection.beginTransaction();

    // Crear el pedido - inicialmente como pendiente
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_ID, status, street, region, commune, postal_code, notes) 
       VALUES (?, 'pendiente', ?, ?, ?, ?, ?)`,
      [
        userId,
        street || null,
        region || null,
        commune || null,
        postal_code || null,
        notes || null,
      ]
    );

    const orderId = orderResult.insertId;

    // Insertar los items del pedido
    for (const item of items) {
      await connection.query(
        `INSERT INTO order_items (order_ID, variant_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.variant_ID, item.quantity, item.price]
      );

      // Actualizar el stock
      await connection.query(
        `UPDATE product_variants SET stock = stock - ? WHERE variant_id = ?`,
        [item.quantity, item.variant_ID]
      );
    }

    await connection.commit();

    // Enviar email de confirmación
    try {
      // Obtener información del usuario y los items con detalles
      const [userInfo] = await pool.query(
        "SELECT email, firstname, lastname FROM users WHERE user_ID = ?",
        [userId]
      );

      const [orderItems] = await pool.query(
        `SELECT 
          p.name as product_name,
          c.name as color_name,
          pv.size,
          oi.quantity,
          oi.price
        FROM order_items oi
        INNER JOIN product_variants pv ON oi.variant_id = pv.variant_id
        INNER JOIN products p ON pv.product_id = p.product_ID
        LEFT JOIN colors c ON pv.color_ID = c.color_ID
        WHERE oi.order_ID = ?`,
        [orderId]
      );

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      await sendOrderConfirmation({
        userEmail: userInfo[0].email,
        userName: `${userInfo[0].firstname} ${userInfo[0].lastname}`,
        orderId,
        items: orderItems,
        totalAmount,
        shippingAddress: {
          street,
          commune,
          region,
          postal_code,
        },
      });
    } catch (emailError) {
      // No fallar la orden si el email falla
    }

    res.json({
      success: true,
      order_ID: orderId,
      message: "Pedido creado exitosamente",
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Error al crear el pedido" });
  } finally {
    connection.release();
  }
};

// Confirmar pago de un pedido (cuando PayPal confirma)
export const confirmOrderPayment = async (req, res) => {
  try {
    const { orderId, paypalOrderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "ID de pedido requerido" });
    }

    // Actualizar el pedido a pagado
    await pool.query(`UPDATE orders SET status = 'pagado' WHERE order_ID = ?`, [
      orderId,
    ]);

    res.json({
      success: true,
      message: "Pago confirmado exitosamente",
    });
  } catch (error) {
    res.status(500).json({ error: "Error al confirmar el pago" });
  }
};

// Obtener todos los pedidos de un usuario
export const getMyOrders = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const userId = req.user.user_ID;

    // Obtener los pedidos del usuario
    const [orders] = await pool.query(
      `SELECT 
        o.order_ID,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_price,
        o.order_date,
        o.status,
        o.street,
        o.region,
        o.commune,
        o.postal_code,
        o.notes
      FROM orders o
      LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
      WHERE o.user_ID = ?
      GROUP BY o.order_ID, o.order_date, o.status, o.street, o.region, o.commune, o.postal_code, o.notes
      ORDER BY o.order_date DESC`,
      [userId]
    );

    // Para cada pedido, obtener sus items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT 
            p.name as product_name,
            b.name as brand_name,
            c.name as color_name,
            v.size,
            oi.quantity,
            oi.price,
            (SELECT image_url FROM product_images WHERE product_id = p.product_ID LIMIT 1) as image_url
          FROM order_items oi
          INNER JOIN product_variants v ON oi.variant_id = v.variant_id
          INNER JOIN products p ON v.product_id = p.product_ID
          INNER JOIN brands b ON p.brand_id = b.brand_id
          INNER JOIN colors c ON v.color_ID = c.color_ID
          WHERE oi.order_ID = ?`,
          [order.order_ID]
        );

        return {
          ...order,
          items,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
};

// Obtener todos los pedidos (ADMIN)
export const getAllOrders = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.type_ID !== 2) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Obtener todos los pedidos con información del usuario
    const [orders] = await pool.query(
      `SELECT 
        o.order_ID,
        o.user_ID,
        u.rut,
        CONCAT(u.firstname, ' ', u.lastname) as user_name,
        u.email as user_email,
        u.phone,
        COALESCE(SUM(oi.price * oi.quantity), 0) as total_price,
        o.order_date,
        o.status,
        o.street,
        o.region,
        o.commune,
        o.postal_code,
        o.notes
      FROM orders o
      INNER JOIN users u ON o.user_ID = u.user_ID
      LEFT JOIN order_items oi ON o.order_ID = oi.order_ID
      GROUP BY o.order_ID, o.user_ID, u.rut, u.firstname, u.lastname, u.email, u.phone, o.order_date, o.status, o.street, o.region, o.commune, o.postal_code, o.notes
      ORDER BY o.order_date DESC`
    );

    // Para cada pedido, obtener sus items
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const [items] = await pool.query(
          `SELECT 
            p.name as product_name,
            b.name as brand_name,
            c.name as color_name,
            v.size,
            oi.quantity,
            oi.price,
            (SELECT image_url FROM product_images WHERE product_id = p.product_ID LIMIT 1) as image_url
          FROM order_items oi
          INNER JOIN product_variants v ON oi.variant_id = v.variant_id
          INNER JOIN products p ON v.product_id = p.product_ID
          INNER JOIN brands b ON p.brand_id = b.brand_id
          INNER JOIN colors c ON v.color_ID = c.color_ID
          WHERE oi.order_ID = ?`,
          [order.order_ID]
        );

        return {
          ...order,
          items,
        };
      })
    );

    res.json(ordersWithItems);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener todos los pedidos" });
  }
};

// Actualizar estado de un pedido (ADMIN)
export const updateOrderStatus = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.type_ID !== 2) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pendiente",
      "pagado",
      "enviado",
      "entregado",
      "cancelado",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Estado no válido" });
    }

    await pool.query(`UPDATE orders SET status = ? WHERE order_ID = ?`, [
      status,
      orderId,
    ]);

    // Enviar email de actualización de estado
    try {
      const [orderInfo] = await pool.query(
        `SELECT u.email, u.firstname, u.lastname, o.order_ID
         FROM orders o
         INNER JOIN users u ON o.user_ID = u.user_ID
         WHERE o.order_ID = ?`,
        [orderId]
      );

      if (orderInfo.length > 0) {
        const statusTexts = {
          pendiente: "Pendiente",
          pagado: "Pagado",
          enviado: "Enviado",
          entregado: "Entregado",
          cancelado: "Cancelado",
        };

        await sendOrderStatusUpdate({
          userEmail: orderInfo[0].email,
          userName: `${orderInfo[0].firstname} ${orderInfo[0].lastname}`,
          orderId,
          status,
          statusText: statusTexts[status],
        });
      }
    } catch (emailError) {
      // No fallar la actualización si el email falla
    }

    res.json({ success: true, message: "Estado actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado" });
  }
};
