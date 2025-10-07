import express from "express";
import indexRouter from "./routes/index.routes.js";
import loginRouter from "./routes/login.routes.js";
import registerRouter from "./routes/register.routes.js";

const app = express();

app.use(indexRouter);
app.use(loginRouter);
app.use(registerRouter);

const PORT = 3000;
app.listen(PORT);
console.log("Servidor ejecutandose en el puerto ", PORT);
