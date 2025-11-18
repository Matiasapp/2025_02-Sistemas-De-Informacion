import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function LogoutButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);

      const data = await response.json();

      alert(data.message || "Sesión cerrada exitosamente");
      navigate("/");
    } catch (err) {}
  };

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        handleLogout();
      }}
      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/20 hover:text-white"
    >
      Cerrar sesión
    </a>
  );
}
