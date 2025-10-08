import { Router } from "express";

const router = Router();

router.get("/register", (req, res) => {
  res.render("register");
});

export default router;
