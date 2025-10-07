import { Router } from "express";

const login = Router();

login.get("/login", (req, res) => {
  res.send("Login");
});

export default login;
