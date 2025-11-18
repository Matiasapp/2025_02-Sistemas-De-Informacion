import { PayPalButtons } from "@paypal/react-paypal-js";
import axios from "axios";

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
  const createOrder = async (data: any, actions: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/paypal/create-order",
        {
          amount: amount.toString(),
          description: description,
          peticionId: peticionId,
        }
      );

      return response.data.orderID;
    } catch (error: any) {
      if (onError) onError(error);
      throw error;
    }
  };

  const onApprove = async (data: any, actions: any) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/paypal/capture-order",
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
