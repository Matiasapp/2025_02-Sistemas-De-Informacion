import nodemailer from "nodemailer";

// Configuración del transporter de nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Función helper para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(amount);
};

// Email de confirmación de pedido
export const sendOrderConfirmation = async (orderData) => {
  const { userEmail, userName, orderId, items, totalAmount, shippingAddress } =
    orderData;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.product_name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.color_name
      } - Talla ${item.size}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(
        item.price
      )}</td>
    </tr>
  `
    )
    .join("");

  const mailOptions = {
    from: `"Tienda de Ropa" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Confirmación de Pedido #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            .total { font-size: 18px; font-weight: bold; color: #667eea; text-align: right; padding: 15px; background: #f0f4ff; border-radius: 8px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Gracias por tu compra!</h1>
              <p>Pedido #${orderId}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>Hemos recibido tu pedido y lo estamos preparando. Te notificaremos cuando sea enviado.</p>
              
              <div class="order-details">
                <h3>Detalles del Pedido</h3>
                <table>
                  <thead>
                    <tr style="background: #f5f5f5;">
                      <th style="padding: 10px; text-align: left;">Producto</th>
                      <th style="padding: 10px; text-align: left;">Variante</th>
                      <th style="padding: 10px; text-align: center;">Cantidad</th>
                      <th style="padding: 10px; text-align: right;">Precio</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                <div class="total">
                  Total: ${formatCurrency(totalAmount)}
                </div>
              </div>

              ${
                shippingAddress
                  ? `
              <div class="order-details">
                <h3>Dirección de Envío</h3>
                <p>
                  ${shippingAddress.street}<br>
                  ${shippingAddress.commune}, ${shippingAddress.region}<br>
                  Código Postal: ${shippingAddress.postal_code || "N/A"}
                </p>
              </div>
              `
                  : ""
              }

              <p>Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.</p>
            </div>
            <div class="footer">
              <p>© 2025 Tienda de Ropa. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email de cambio de estado de pedido
export const sendOrderStatusUpdate = async (orderData) => {
  const { userEmail, userName, orderId, status, statusText } = orderData;

  const statusColors = {
    pending: "#FFA500",
    pagado: "#4CAF50",
    processing: "#2196F3",
    shipped: "#9C27B0",
    enviado: "#9C27B0",
    delivered: "#4CAF50",
    entregado: "#4CAF50",
    cancelled: "#F44336",
    cancelado: "#F44336",
  };

  const color = statusColors[status] || "#666";

  const mailOptions = {
    from: `"Tienda de Ropa" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `Actualización de Pedido #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .status-badge { display: inline-block; background: ${color}; color: white; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Estado de tu Pedido</h1>
              <p>Pedido #${orderId}</p>
            </div>
            <div class="content">
              <p>Hola <strong>${userName}</strong>,</p>
              <p>El estado de tu pedido ha cambiado a:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span class="status-badge">${statusText}</span>
              </div>
              ${
                status === "enviado" || status === "shipped"
                  ? `<p>Tu pedido está en camino. Recibirás una notificación cuando sea entregado.</p>`
                  : status === "entregado" || status === "delivered"
                  ? `<p>¡Tu pedido ha sido entregado! Esperamos que disfrutes tu compra.</p>`
                  : status === "cancelado" || status === "cancelled"
                  ? `<p>Tu pedido ha sido cancelado. Si tienes alguna pregunta, contáctanos.</p>`
                  : `<p>Estamos procesando tu pedido. Te mantendremos informado.</p>`
              }
              <p>Puedes ver el detalle completo de tu pedido en tu cuenta.</p>
            </div>
            <div class="footer">
              <p>© 2025 Tienda de Ropa. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email de bienvenida
export const sendWelcomeEmail = async (userData) => {
  const { email, firstname } = userData;

  const mailOptions = {
    from: `"Tienda de Ropa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "¡Bienvenido a Tienda de Ropa!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .benefit-item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .benefit-item:last-child { border-bottom: none; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido/a!</h1>
              <p>Gracias por unirte a nuestra comunidad</p>
            </div>
            <div class="content">
              <p>Hola <strong>${firstname}</strong>,</p>
              <p>¡Nos alegra que formes parte de Tienda de Ropa! Estamos aquí para ofrecerte la mejor experiencia de compra.</p>
              
              <div class="benefits">
                <h3>¿Qué puedes hacer ahora?</h3>
                <div class="benefit-item">
                  ✨ Explora nuestro catálogo de productos
                </div>
                <div class="benefit-item">
                  🛒 Agrega productos a tu carrito
                </div>
                <div class="benefit-item">
                  💳 Realiza compras de forma segura
                </div>
                <div class="benefit-item">
                  📦 Rastrea tus pedidos en tiempo real
                </div>
                <div class="benefit-item">
                  ⭐ Guarda tus productos favoritos
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${
                  process.env.FRONTEND_URL || "http://localhost:5174"
                }" class="button">Comenzar a Comprar</a>
              </div>

              <p>Si tienes alguna pregunta, nuestro equipo está aquí para ayudarte.</p>
            </div>
            <div class="footer">
              <p>© 2025 Tienda de Ropa. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Email de alerta de stock bajo (al administrador)
export const sendLowStockAlert = async (products) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const productsHtml = products
    .map(
      (product) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        product.product_name
      }</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        product.color_name
      } - Talla ${product.size}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
        <span style="background: ${
          product.stock === 0
            ? "#f44336"
            : product.stock < 5
            ? "#ff9800"
            : "#ffc107"
        }; color: white; padding: 5px 10px; border-radius: 12px; font-weight: bold;">
          ${product.stock}
        </span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        product.supplier_name || "N/A"
      }</td>
    </tr>
  `
    )
    .join("");

  const mailOptions = {
    from: `"Tienda de Ropa" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `⚠️ Alerta: ${products.length} producto(s) con stock bajo`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: #ff9800; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px; }
            table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; }
            th { background: #f5f5f5; padding: 12px; text-align: left; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Alerta de Stock Bajo</h1>
            </div>
            <div class="content">
              <div class="alert-box">
                <strong>Atención:</strong> Los siguientes productos tienen stock bajo y requieren reabastecimiento.
              </div>
              
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Variante</th>
                    <th style="text-align: center;">Stock</th>
                    <th>Proveedor</th>
                  </tr>
                </thead>
                <tbody>
                  ${productsHtml}
                </tbody>
              </table>

              <p style="margin-top: 20px;">
                <strong>Acción recomendada:</strong> Contacta a los proveedores para reabastecer estos productos.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Tienda de Ropa - Sistema de Alertas Automáticas</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verificar configuración del email
export const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
};
