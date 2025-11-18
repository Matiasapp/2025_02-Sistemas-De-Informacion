import express from "express";
import {
  createOrder,
  captureOrder,
  getOrderDetails,
} from "../controllers/paypalController.js";

const router = express.Router();

// Crear orden de pago
router.post("/create-order", createOrder);

// Capturar orden después de la aprobación
router.post("/capture-order", captureOrder);

// Obtener detalles de una orden
router.get("/orders/:orderID", getOrderDetails);

export default router;
