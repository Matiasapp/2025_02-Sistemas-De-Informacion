import { useNavigate } from "react-router-dom";

export default function AdminPanelForm() {
  const navigate = useNavigate();
  return (
    <div className="min-h-96 space-y-5 flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        Panel de control
      </h1>

      <button
        onClick={() => navigate("/add-product")}
        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
      >
        Añadir producto
      </button>
      <button
        onClick={() => navigate("/modify-product")}
        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
      >
        Modificar producto y Variantes
      </button>
      <button
        onClick={() => navigate("/add-product")}
        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
      >
        Administrar usuarios
      </button>
    </div>
  );
}
