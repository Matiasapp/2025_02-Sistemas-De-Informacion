import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Hombre } from "./pages/Hombre";
import { Mujer } from "./pages/Mujer";
import { Accesorios } from "./pages/Accesorios";
import { Nav } from "./components/Nav";
import { Register } from "./pages/Registerpage";
import { Login } from "./pages/Login";
import { AddProduct } from "./pages/Addproduct";
import { AdminPanel } from "./pages/Controlpanel";
import { ModifyProduct } from "./pages/ModifyProductPage";
import { MostrarProducto } from "./pages/ShowProductPage";
function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hombre" element={<Hombre />} />
        <Route path="/mujer" element={<Mujer />} />
        <Route path="/accesorios" element={<Accesorios />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/control-panel" element={<AdminPanel />} />
        <Route path="/modify-product" element={<ModifyProduct />} />
        <Route path="/product" element={<MostrarProducto />} />
      </Routes>
    </>
  );
}

export default App;
