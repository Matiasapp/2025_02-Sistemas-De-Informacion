import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir automáticamente a Mis Pedidos después de 5 segundos
    const timer = setTimeout(() => {
      navigate("/mis-pedidos");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Pago Exitoso!
        </h1>

        <p className="text-gray-600 mb-6">
          Tu pago ha sido procesado correctamente. Recibirás un correo de
          confirmación en breve.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>

          <button
            onClick={() => navigate("/mis-pedidos")}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ver Mis Pedidos
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
