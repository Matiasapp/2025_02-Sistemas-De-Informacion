import dotenv from "dotenv";
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
import * as ControladorProducto from "./ControladorProducto.js";

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
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
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
    res.json({ user: req.user });
  } else {
    res.status(401).json({ user: null });
  }
});

app.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
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

app.get("/colors", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM colors");
  res.json(rows);
});

const PORT = 3000;
app.listen(PORT);
console.log("Servidor ejecutandose en el puerto ", PORT);
