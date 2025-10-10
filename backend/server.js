import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { registerUser } from "./ControladorRegistro.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.urlencoded({ extended: false }));

app.post("/register", registerUser);

const PORT = 3000;
app.listen(PORT);
console.log("Servidor ejecutandose en el puerto ", PORT);
