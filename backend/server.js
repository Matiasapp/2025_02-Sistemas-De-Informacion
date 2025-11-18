import dotenv from "dotenv";
import fs from "fs";
import { pool } from "./db.js";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { registerUser } from "./ControladorRegistro.js";
import passport from "passport";
import session from "express-session";
import "./passport-config.js";
import initializePassport from "./passport-config.js";
import multer from "multer";
import * as ControladorProducto from "./ControladorAddProducto.js";
import {
  ObtenerUsers,
  ModificarTipoUsuario,
  EliminarUsuario,
} from "./ControladorUsers.js";
import {
  ObtenerColors,
  InsertarColors,
  ActualizarColors,
  EliminarColors,
} from "./ControladorColors.js";
import {
  updateProduct,
  updateVariant,
  SwitchActiveProduct,
  SwitchActiveVariant,
  addVariantController,
  deleteVariantController,
  updateimageMain,
  EliminarImagenesPorColor,
  deleteImageById,
} from "./ControladorModifyProducts.js";
import {
  ObtenerSupplier,
  DeleteSupplier,
  AddSupplier,
  ModifySupplier,
} from "./ControladorSupplier.js";
import { getProductsByCategoryName } from "./ControladorCategorias.js";
import { getAllProducts } from "./ControladorAllProducts.js";
import { searchProducts } from "./ControladorSearch.js";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "./ControladorUserProfile.js";
import {
  requestPasswordReset,
  resetPasswordWithCode,
  verifyResetCode,
} from "./ControladorPasswordReset.js";
import {
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
  getUserCart,
} from "./ControladorCart.js";
import {
  getMyOrders,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  confirmOrderPayment,
} from "./ControladorOrders.js";
import {
  getDashboardMetrics,
  getTopProducts,
  getSalesByPeriod,
  getOrdersByStatus,
  getLowStockProducts,
  getSalesByRegion,
  getMonthlyRevenue,
} from "./ControladorReports.js";
import paypalRoutes from "./routes/paypal.js";

initializePassport(
  passport,
  async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },
  async (user_ID) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_ID = ?", [
      user_ID,
    ]);
    return rows[0];
  }
);

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "../frontend/public/uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 días
      httpOnly: true,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: false }));

app.post("/register", checkNotAuthenticated, registerUser);

app.post(
  "/add-product",
  upload.any(),
  ControladorProducto.addProductController
);
app.use("/uploads", express.static("uploads"));

app.post("/login", checkNotAuthenticated, (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ message: info?.message || "Credenciales inválidas" });
    req.logIn(user, (err) => {
      if (err) return next(err);
      req.session.save((saveErr) => {
        if (saveErr) return next(saveErr);
        return res.json({
          message: "Inicio de sesión exitoso",
          user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
          },
        });
      });
    });
  })(req, res, next);
});

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Sesión cerrada correctamente" });
    });
  });
});

export function checkAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  if (req.user.type_ID !== 2) {
    return res.redirect("/");
  }

  next();
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
}
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.get("/auth/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ user: req.user });
  }
  res.status(401).json({ message: "No autenticado" });
});

app.get("/products/:id", async (req, res) => {
  const product_ID = Number(req.params.id);
  try {
    // Traer producto
    const [productRows] = await pool.query(
      "SELECT * FROM products WHERE product_ID = ?",
      [product_ID]
    );

    if (productRows.length === 0)
      return res.status(404).json({ message: "No encontrado" });

    const product = productRows[0];

    // Traer variantes con nombres consistentes
    const [variantRows] = await pool.query(
      `SELECT 
        variant_id as variant_ID,
        product_id as product_ID,
        color_ID,
        size,
        price,
        stock,
        is_active,
        sku
      FROM product_variants 
      WHERE product_ID = ?`,
      [product_ID]
    );

    // Traer imágenes genéricas del producto (variant_id es NULL)
    const [productImages] = await pool.query(
      "SELECT * FROM product_images WHERE product_id = ?",
      [product_ID]
    );

    // Asignar imágenes a variantes según color
    for (let variant of variantRows) {
      variant.images = productImages
        .filter((img) => img.color_id === variant.color_ID)
        .map((img) => ({
          url: img.image_url,
          is_main: img.is_main === 1,
          image_id: img.image_id,
          color_id: img.color_id,
        }));
    }

    res.json({
      ...product,
      variants: variantRows || [],
    });
  } catch (err) {
    res.status(500).json({ message: "Error interno" });
  }
});
app.post("/product-images/by-color", EliminarImagenesPorColor);

app.delete("/product-images/:id", deleteImageById);

app.post("/product-images", upload.single("image"), async (req, res) => {
  try {
    const { product_id, color_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No se subió archivo" });

    const image_url = `../frontend/public/uploads/${file.filename}`;

    await pool.query(
      "INSERT INTO product_images (product_id, color_id, image_url) VALUES (?, ?, ?)",
      [product_id, color_id, image_url]
    );

    res.json({ success: true, url: image_url });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error al subir imagen" });
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM products WHERE product_ID = ?", [id]);
    res.status(200).json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

app.post("/product-images/:product_id", async (req, res) => {
  const { product_id, color_id, url } = req.body;

  if (!product_id || !color_id) {
    return res.status(400).json({ message: "Faltan parámetros" });
  }

  const image_url = "../frontend/public" + url;

  try {
    // Borrar de la base de datos
    const [result] = await pool.query(
      "DELETE FROM product_images WHERE product_id = ? AND color_id = ?",
      [product_id, color_id, image_url]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Imagen no encontrada" });
    }

    // Borrar archivo físico
    const imagePath = path.join(
      __dirname,
      "../frontend/public",
      url.replace(/^\/+/, "")
    );
    fs.unlink(imagePath, (err) => {
      // Silently ignore
    });

    res.json({ success: true, message: "Imagen eliminada correctamente" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error al eliminar imagen" });
  }
});

app.get("/sizes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [productRows] = await pool.query(
      "SELECT * FROM product_variants WHERE size = ?",
      [id]
    );
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la talla" });
  }
});
app.get("/sizes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [productRows] = await pool.query(
      "SELECT * FROM product_variants WHERE size = ?",
      [id]
    );
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la talla" });
  }
});

app.put("/products/:id", upload.any(), updateProduct);
app.post("/update-image-main", updateimageMain);
app.put("/products/:id/active", SwitchActiveProduct);
app.put("/variants/:id/active", SwitchActiveVariant);

app.post("/variants", addVariantController);
app.put("/variants/:variant_id", updateVariant);
app.delete("/variants/:variant_id", deleteVariantController);
app.get("/categoria/:name", getProductsByCategoryName);
app.get("/all-products", getAllProducts);
app.get("/search", searchProducts);

app.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
});

app.post("/categories", async (req, res) => {
  try {
    const { name, size_type } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre de la categoría es requerido" });
    }

    // size_type: optional, allowed values: 'letter' | 'numeric'. Default to 'letter'
    const allowed = ["letter", "numeric"];
    const st = allowed.includes(size_type) ? size_type : "letter";

    const [result] = await pool.query(
      "INSERT INTO categories (name, size_type) VALUES (?, ?)",
      [name.trim(), st]
    );

    res.status(201).json({
      success: true,
      message: "Categoría creada correctamente",
      category: {
        category_ID: result.insertId,
        name: name.trim(),
        size_type: st,
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "Ya existe una categoría con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al crear la categoría" });
    }
  }
});

app.put("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, size_type } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre de la categoría es requerido" });
    }

    const allowed = ["letter", "numeric"];
    const st = allowed.includes(size_type) ? size_type : null;

    let result;
    if (st) {
      [result] = await pool.query(
        "UPDATE categories SET name = ?, size_type = ? WHERE category_ID = ?",
        [name.trim(), st, id]
      );
    } else {
      [result] = await pool.query(
        "UPDATE categories SET name = ? WHERE category_ID = ?",
        [name.trim(), id]
      );
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      success: true,
      message: "Categoría actualizada correctamente",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "Ya existe una categoría con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al actualizar la categoría" });
    }
  }
});

app.delete("/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay productos usando esta categoría
    const [productsUsingCategory] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE category_ID = ?",
      [id]
    );

    if (productsUsingCategory[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar la categoría porque está siendo usada por ${productsUsingCategory[0].count} producto(s)`,
      });
    }

    const [result] = await pool.query(
      "DELETE FROM categories WHERE category_ID = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.json({
      success: true,
      message: "Categoría eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");

    if (rows.length === 0) {
      return res.json([]);
    }

    // Obtener todas las variantes de una vez usando IN
    const productIds = rows.map((p) => p.product_ID);
    const [variantRows] = await pool.query(
      "SELECT * FROM product_variants WHERE product_id IN (?)",
      [productIds]
    );

    // Agrupar variantes por product_ID
    const variantsByProduct = {};
    variantRows.forEach((variant) => {
      if (!variantsByProduct[variant.product_id]) {
        variantsByProduct[variant.product_id] = [];
      }
      variantsByProduct[variant.product_id].push(variant);
    });

    // Combinar productos con sus variantes
    const productsWithVariants = rows.map((product) => ({
      ...product,
      variants: variantsByProduct[product.product_ID] || [],
    }));

    res.json(productsWithVariants);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos" });
  }
});

app.get("/brands", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM brands");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener marcas" });
  }
});

app.post("/brands", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre de la marca es requerido" });
    }

    const [result] = await pool.query("INSERT INTO brands (name) VALUES (?)", [
      name.trim(),
    ]);

    res.status(201).json({
      success: true,
      message: "Marca creada correctamente",
      brand: {
        brand_id: result.insertId,
        name: name.trim(),
      },
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Ya existe una marca con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al crear la marca" });
    }
  }
});

app.put("/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "El nombre de la marca es requerido" });
    }

    const [result] = await pool.query(
      "UPDATE brands SET name = ? WHERE brand_id = ?",
      [name.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }

    res.json({
      success: true,
      message: "Marca actualizada correctamente",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ message: "Ya existe una marca con ese nombre" });
    } else {
      res.status(500).json({ message: "Error al actualizar la marca" });
    }
  }
});

app.delete("/brands/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay productos usando esta marca
    const [productsUsingBrand] = await pool.query(
      "SELECT COUNT(*) as count FROM products WHERE brand_id = ?",
      [id]
    );

    if (productsUsingBrand[0].count > 0) {
      return res.status(400).json({
        message: `No se puede eliminar la marca porque está siendo usada por ${productsUsingBrand[0].count} producto(s)`,
      });
    }

    const [result] = await pool.query("DELETE FROM brands WHERE brand_id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Marca no encontrada" });
    }

    res.json({
      success: true,
      message: "Marca eliminada correctamente",
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la marca" });
  }
});

// Endpoints para gestión de colores
app.get("/colors", ObtenerColors);
app.post("/colors", InsertarColors);
app.put("/colors/:id", ActualizarColors);
app.delete("/colors/:id", EliminarColors);

// Endpoints para gestión de proveedores
app.get("/suppliers", ObtenerSupplier);
app.post("/suppliers", AddSupplier);
app.put("/suppliers/:id", ModifySupplier);
app.delete("/suppliers/:id", DeleteSupplier);

// Endpoints para gestión de usuarios
app.get("/users", ObtenerUsers);
app.put("/users/:id/role", ModificarTipoUsuario);
app.delete("/users/:id", EliminarUsuario);

// Endpoints para perfil de usuario
app.get("/user/:id", getUserProfile);
app.put("/user/:id", updateUserProfile);
app.post("/user/change-password", changePassword);

// Endpoints para recuperación de contraseña
app.post("/forgot-password", requestPasswordReset);
app.post("/reset-password", resetPasswordWithCode);
app.post("/verify-reset-code", verifyResetCode);

// Endpoints para carrito de compras
app.post("/cart/get", getOrCreateCart);
app.post("/cart/add", addToCart);
app.put("/cart/item/:cart_item_ID", updateCartItem);
app.delete("/cart/item/:cart_item_ID", removeFromCart);
app.delete("/cart/clear/:user_ID", clearCart);
app.post("/cart/sync", syncCart);
app.get("/admin/users/:userId/cart", getUserCart);

// Endpoint para pedidos
app.get("/my-orders", getMyOrders);
app.post("/orders", createOrder);
app.post("/orders/confirm-payment", confirmOrderPayment);

// Endpoints de administración de pedidos
app.get("/admin/orders", getAllOrders);
app.put("/admin/orders/:orderId/status", updateOrderStatus);

// Endpoints para reportes y estadísticas
app.get("/admin/reports/dashboard", getDashboardMetrics);
app.get("/admin/reports/top-products", getTopProducts);
app.get("/admin/reports/sales-by-period", getSalesByPeriod);
app.get("/admin/reports/orders-by-status", getOrdersByStatus);
app.get("/admin/reports/low-stock", getLowStockProducts);
app.get("/admin/reports/sales-by-region", getSalesByRegion);
app.get("/admin/reports/monthly-revenue", getMonthlyRevenue);

// Endpoints para PayPal
app.use("/api/paypal", paypalRoutes);

const PORT = 3000;
app.listen(PORT);
