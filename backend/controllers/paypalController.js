import paypal from "@paypal/checkout-server-sdk";
import paypalClient from "../config/paypal.js";

// Crear una orden de pago
export const createOrder = async (req, res) => {
  try {
    const { amount, description, peticionId } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description: description || "Pago de servicio",
          custom_id: peticionId?.toString() || "",
        },
      ],
      application_context: {
        brand_name: "Tienda Online",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      },
    });

    const order = await paypalClient().execute(request);

    res.json({
      orderID: order.result.id,
      status: order.result.status,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al crear la orden de pago",
      details: error.message,
    });
  }
};

// Capturar el pago después de la aprobación
export const captureOrder = async (req, res) => {
  try {
    const { orderID } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const capture = await paypalClient().execute(request);

    // Aquí puedes guardar la información del pago en tu base de datos
    const paymentData = {
      orderID: capture.result.id,
      status: capture.result.status,
      amount:
        capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.value || "0",
      currency:
        capture.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
          ?.currency_code || "USD",
      payerEmail: capture.result.payer?.email_address || "",
      payerName: capture.result.payer?.name
        ? `${capture.result.payer.name.given_name || ""} ${
            capture.result.payer.name.surname || ""
          }`
        : "",
      peticionId: capture.result.purchase_units?.[0]?.custom_id || "",
      captureTime:
        capture.result.purchase_units?.[0]?.payments?.captures?.[0]
          ?.create_time || new Date().toISOString(),
    };

    res.json({
      success: true,
      orderID: capture.result.id,
      status: capture.result.status,
      paymentData,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al procesar el pago",
      details: error.message,
    });
  }
};

// Obtener detalles de una orden
export const getOrderDetails = async (req, res) => {
  try {
    const { orderID } = req.params;

    const request = new paypal.orders.OrdersGetRequest(orderID);
    const order = await paypalClient().execute(request);

    res.json(order.result);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener detalles de la orden",
      details: error.message,
    });
  }
};
