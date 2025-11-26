import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";
import { useToast } from "../context/AlertaToast";

interface PayPalButtonProps {
  amount: number;
  description: string;
  peticionId?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  description,
  peticionId,
  onSuccess,
  onError,
}) => {
  const { showToast } = useToast();

  const createOrder = async (data: any, actions: any) => {
    try {
      // Asegurar que el monto tenga exactamente 2 decimales
      const formattedAmount = parseFloat(amount.toString()).toFixed(2);

      console.log("🔹 Creando orden con monto:", formattedAmount);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/paypal/create-order`,
        {
          amount: formattedAmount,
          description: description,
          peticionId: peticionId,
        }
      );

      console.log("✅ Orden creada:", response.data.orderID);
      return response.data.orderID;
    } catch (error: any) {
      console.error(
        "❌ Error en createOrder:",
        error.response?.data || error.message
      );

      // Mostrar mensaje más amigable al usuario
      const errorMessage =
        error.response?.data?.details ||
        error.response?.data?.error ||
        "Error al procesar el pago. Por favor, intenta nuevamente.";

      showToast(errorMessage, "error");

      if (onError) onError(error);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/paypal/capture-order`,
        {
          orderID: data.orderID,
        }
      );

      if (response.data.success) {
        if (onSuccess) onSuccess(response.data);
        return response.data;
      }
    } catch (error) {
      if (onError) onError(error);
      throw error;
    }
  };

  return (
    <PayPalButtons
      createOrder={createOrder}
      onApprove={onApprove}
      onError={(err: any) => {
        if (onError) onError(err);
      }}
      style={{
        layout: "vertical",
        color: "gold",
        shape: "rect",
        label: "paypal",
      }}
    />
  );
};

export default PayPalButton;
