import { useState } from "react";
import { useAuth } from "../context/authcontext";
import { useCart } from "../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function LoginForm() {
  const { setUser, refreshUser } = useAuth();
  const { syncCartOnLogin } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Actualizar usuario inmediatamente
        setUser(data.user);

        // 2. Esperar a que se refresque el usuario desde el backend
        await refreshUser();

        // 3. Sincronizar carrito del localStorage con la base de datos
        await syncCartOnLogin();

        // 4. Mostrar mensaje de éxito
        alert(data.message || "Inicio de sesión exitoso");

        // 5. Verificar si hay una redirección guardada
        const redirectPath = localStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          localStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      } else {
        alert(data.message || "Credenciales inválidas");
      }
    } catch (err) {
      alert("Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white shadow rounded mt-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      <input
        type="email"
        name="email"
        placeholder="Correo"
        onChange={handleChange}
        className="w-full border p-2 mb-3 rounded"
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Contraseña"
        onChange={handleChange}
        className="w-full border p-2 mb-4 rounded"
        required
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="text-blue-600 hover:text-blue-700 text-sm hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </form>
  );
}

export default LoginForm;
