import { Router } from "express";

const router = Router();

router.get("/carrito", (req, res) => {
  res.render("carrito");
});

export default router;
