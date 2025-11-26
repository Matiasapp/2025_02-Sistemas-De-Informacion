import { useAuth } from "../context/authcontext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/AlertaToast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function LogoutButton() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${backendUrl}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);

      const data = await response.json();

      showToast(data.message || "Sesión cerrada exitosamente", "success");
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
