import { pool } from "./db.js";

// Obtener o crear carrito del usuario
export const getOrCreateCart = async (req, res) => {
  try {
    // Obtener user_ID de la sesión
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user_ID = req.user.user_ID;

    // Buscar carrito existente
    let [carts] = await pool.query("SELECT * FROM cart WHERE user_ID = ?", [
      user_ID,
    ]);

    let cart;
    if (carts.length === 0) {
      // Crear nuevo carrito
      const [result] = await pool.query(
        "INSERT INTO cart (user_ID) VALUES (?)",
        [user_ID]
      );
      cart = { cart_ID: result.insertId, user_ID };
    } else {
      cart = carts[0];
    }

    // Obtener items del carrito con información completa
    const [items] = await pool.query(
      `SELECT 
        ci.cart_item_ID,
        ci.variant_ID,
        ci.quantity,
        p.product_ID,
        p.name AS product_name,
        b.name AS brand_name,
        c.name AS color_name,
        pv.size,
        pv.price,
        pv.stock,
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_ID = p.product_ID 
         AND pi.color_ID = pv.color_ID 
         AND pi.is_main = 1 
         LIMIT 1) AS image_url
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_ID
      LEFT JOIN brands b ON p.brand_ID = b.brand_ID
      LEFT JOIN colors c ON pv.color_ID = c.color_ID
      WHERE ci.cart_ID = ?`,
      [cart.cart_ID]
    );

    res.json({ cart, items });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

// Agregar item al carrito
export const addToCart = async (req, res) => {
  try {
    const { variant_ID, quantity } = req.body;

    if (!variant_ID || !quantity) {
      return res.status(400).json({
        message: "Faltan datos requeridos",
        debug: { variant_ID, quantity, body: req.body },
      });
    }

    // Obtener user_ID de la sesión
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user_ID = req.user.user_ID;

    // Obtener o crear carrito
    let [carts] = await pool.query("SELECT * FROM cart WHERE user_ID = ?", [
      user_ID,
    ]);

    let cart_ID;
    if (carts.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO cart (user_ID) VALUES (?)",
        [user_ID]
      );
      cart_ID = result.insertId;
    } else {
      cart_ID = carts[0].cart_ID;
    }

    // Verificar stock disponible y obtener product_id
    const [variants] = await pool.query(
      "SELECT stock, product_id FROM product_variants WHERE variant_id = ?",
      [variant_ID]
    );

    if (variants.length === 0) {
      return res.status(404).json({ message: "Variante no encontrada" });
    }

    const availableStock = variants[0].stock;
    const product_id = variants[0].product_id;

    // Verificar si el item ya existe en el carrito
    const [existingItems] = await pool.query(
      "SELECT * FROM cart_items WHERE cart_ID = ? AND variant_ID = ?",
      [cart_ID, variant_ID]
    );

    if (existingItems.length > 0) {
      // Actualizar cantidad existente
      const currentQuantity = existingItems[0].quantity;
      const newQuantity = Math.min(currentQuantity + quantity, availableStock);

      if (currentQuantity >= availableStock) {
        return res.status(400).json({
          message: `Stock máximo alcanzado: ${availableStock}`,
        });
      }

      await pool.query(
        "UPDATE cart_items SET quantity = ? WHERE cart_item_ID = ?",
        [newQuantity, existingItems[0].cart_item_ID]
      );

      res.json({
        message: "Cantidad actualizada",
        added: newQuantity - currentQuantity,
      });
    } else {
      // Agregar nuevo item
      const finalQuantity = Math.min(quantity, availableStock);

      await pool.query(
        "INSERT INTO cart_items (cart_ID, product_ID, variant_ID, quantity) VALUES (?, ?, ?, ?)",
        [cart_ID, product_id, variant_ID, finalQuantity]
      );

      res.json({ message: "Item agregado al carrito", added: finalQuantity });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al agregar al carrito" });
  }
};

// Actualizar cantidad de un item
export const updateCartItem = async (req, res) => {
  try {
    const { cart_item_ID } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Cantidad inválida" });
    }

    // Verificar stock disponible
    const [items] = await pool.query(
      `SELECT ci.*, pv.stock 
       FROM cart_items ci 
       JOIN product_variants pv ON ci.variant_id = pv.variant_id 
       WHERE ci.cart_item_ID = ?`,
      [cart_item_ID]
    );

    if (items.length === 0) {
      return res.status(404).json({ message: "Item no encontrado" });
    }

    const availableStock = items[0].stock;
    const finalQuantity = Math.min(quantity, availableStock);

    await pool.query(
      "UPDATE cart_items SET quantity = ? WHERE cart_item_ID = ?",
      [finalQuantity, cart_item_ID]
    );

    res.json({ message: "Cantidad actualizada", quantity: finalQuantity });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar item" });
  }
};

// Eliminar item del carrito
export const removeFromCart = async (req, res) => {
  try {
    const { cart_item_ID } = req.params;

    await pool.query("DELETE FROM cart_items WHERE cart_item_ID = ?", [
      cart_item_ID,
    ]);

    res.json({ message: "Item eliminado del carrito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar item" });
  }
};

// Vaciar carrito
export const clearCart = async (req, res) => {
  try {
    const { user_ID } = req.params;

    const [carts] = await pool.query("SELECT * FROM cart WHERE user_ID = ?", [
      user_ID,
    ]);

    if (carts.length > 0) {
      await pool.query("DELETE FROM cart_items WHERE cart_ID = ?", [
        carts[0].cart_ID,
      ]);
    }

    res.json({ message: "Carrito vaciado" });
  } catch (error) {
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
};

// Sincronizar carrito de localStorage con base de datos
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    // Obtener user_ID de la sesión
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "No autenticado" });
    }

    const user_ID = req.user.user_ID;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "Datos inválidos" });
    }

    // Obtener o crear carrito
    let [carts] = await pool.query("SELECT * FROM cart WHERE user_ID = ?", [
      user_ID,
    ]);

    let cart_ID;
    if (carts.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO cart (user_ID) VALUES (?)",
        [user_ID]
      );
      cart_ID = result.insertId;
    } else {
      cart_ID = carts[0].cart_ID;
    }

    // Agregar cada item del localStorage
    for (const item of items) {
      const { variant_ID, quantity } = item;

      // Verificar si ya existe
      const [existing] = await pool.query(
        "SELECT * FROM cart_items WHERE cart_ID = ? AND variant_ID = ?",
        [cart_ID, variant_ID]
      );

      const [productVariant] = await pool.query(
        "SELECT product_id, stock FROM product_variants WHERE variant_id = ?",
        [variant_ID]
      );

      if (productVariant.length === 0) continue;

      const finalQuantity = Math.min(quantity, productVariant[0].stock);

      if (existing.length > 0) {
        // Actualizar cantidad (tomar el mayor)
        const newQuantity = Math.max(existing[0].quantity, finalQuantity);
        await pool.query(
          "UPDATE cart_items SET quantity = ? WHERE cart_item_ID = ?",
          [newQuantity, existing[0].cart_item_ID]
        );
      } else {
        // Insertar nuevo
        await pool.query(
          "INSERT INTO cart_items (cart_ID, product_ID, variant_ID, quantity) VALUES (?, ?, ?, ?)",
          [cart_ID, productVariant[0].product_id, variant_ID, finalQuantity]
        );
      }
    }

    res.json({ message: "Carrito sincronizado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al sincronizar carrito" });
  }
};

// Obtener carrito de un usuario específico (ADMIN)
export const getUserCart = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.type_ID !== 2) {
      return res.status(403).json({ error: "No autorizado" });
    }

    const { userId } = req.params;

    // Buscar carrito del usuario
    const [carts] = await pool.query("SELECT * FROM cart WHERE user_ID = ?", [
      userId,
    ]);

    if (carts.length === 0) {
      return res.json({ items: [], total: 0 });
    }

    const cart = carts[0];

    // Obtener items del carrito con información completa
    const [items] = await pool.query(
      `SELECT 
        ci.cart_item_ID,
        ci.variant_ID,
        ci.quantity,
        p.product_ID,
        p.name AS product_name,
        b.name AS brand_name,
        c.name AS color_name,
        pv.size,
        pv.price,
        pv.stock,
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_ID = p.product_ID 
         AND pi.color_ID = pv.color_ID 
         AND pi.is_main = 1 
         LIMIT 1) AS image_url
      FROM cart_items ci
      JOIN product_variants pv ON ci.variant_id = pv.variant_id
      JOIN products p ON pv.product_id = p.product_ID
      LEFT JOIN brands b ON p.brand_ID = b.brand_ID
      LEFT JOIN colors c ON pv.color_ID = c.color_ID
      WHERE ci.cart_ID = ?`,
      [cart.cart_ID]
    );

    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.json({ items, total });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener carrito del usuario" });
  }
};
