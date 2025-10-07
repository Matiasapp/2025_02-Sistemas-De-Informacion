import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Pagina principal");
});

export default router;
