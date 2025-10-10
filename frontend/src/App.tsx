import { Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Hombre } from "./pages/Hombre";
import { Mujer } from "./pages/Mujer";
import { Accesorios } from "./pages/Accesorios";
import { Nav } from "./components/Nav";
import { Register } from "./pages/Registerpage";
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
      </Routes>
    </>
  );
}

export default App;
