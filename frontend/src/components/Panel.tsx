import { useNavigate } from "react-router-dom";

export default function AdminPanelForm() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen space-y-4 flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Panel de control
      </h1>

      <button
        onClick={() => navigate("/add-product")}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Añadir producto
      </button>
      <button
        onClick={() => navigate("/add-product")}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Modificar producto y Variantes
      </button>
      <button
        onClick={() => navigate("/add-product")}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300"
      >
        Administrar usuarios
      </button>
    </div>
  );
}
