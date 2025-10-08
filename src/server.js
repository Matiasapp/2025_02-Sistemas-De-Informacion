import express from "express";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import indexRouter from "./routes/index.routes.js";
import loginRouter from "./routes/login.routes.js";
import registerRouter from "./routes/register.routes.js";
import carritoRouter from "./routes/carrito.routes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.static("public"));

app.use(indexRouter);
app.use(loginRouter);
app.use(registerRouter);
app.use(carritoRouter);

const PORT = 3000;
app.listen(PORT);
console.log("Servidor ejecutandose en el puerto ", PORT);
