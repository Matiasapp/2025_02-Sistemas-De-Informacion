import { Routes, Route } from "react-router-dom";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Home } from "./pages/Home";
import { Nav } from "./components/Nav";
import { Register } from "./pages/Registerpage";
import { Login } from "./pages/Login";
import { AddProduct } from "./pages/Addproduct";
import { AdminPanel } from "./pages/Controlpanel";
import { ModifyProducto } from "./pages/ModifyProductPage";
import { MostrarProducto } from "./pages/ShowProductPage";
import { ManageUsersPage } from "./pages/ManageUsersPage";
import { ManageSuppliersPage } from "./pages/ManageSuppliersPage";
import { ManageOrdersPage } from "./pages/ManageOrdersPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CategoriaPage } from "./pages/CategoriaPage";
import { AllProductsPage } from "./pages/AllProductsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SearchPage } from "./pages/SearchPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { CartPage } from "./pages/CartPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import { ProtectedAdminRoute } from "./components/ProtectedAdminRoute";
import { CartProvider } from "./context/CartContext";

const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "",
  currency: "USD",
  intent: "capture",
};

function App() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <CartProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas de administrador */}
          <Route
            path="/add-product"
            element={
              <ProtectedAdminRoute>
                <AddProduct />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/control-panel"
            element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/modify-product"
            element={
              <ProtectedAdminRoute>
                <ModifyProducto />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedAdminRoute>
                <ManageUsersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/manage-suppliers"
            element={
              <ProtectedAdminRoute>
                <ManageSuppliersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/manage-orders"
            element={
              <ProtectedAdminRoute>
                <ManageOrdersPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedAdminRoute>
                <DashboardPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Rutas públicas */}
          <Route path="/producto/:id" element={<MostrarProducto />} />
          <Route
            path="/categoria/:nombreCategoria"
            element={<CategoriaPage />}
          />
          <Route path="/productos" element={<AllProductsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/mis-pedidos" element={<MyOrdersPage />} />

          {/* Rutas de pago */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/cancel" element={<PaymentCancel />} />

          {/* Ruta 404 - debe ir al final */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </PayPalScriptProvider>
  );
}

export default App;
