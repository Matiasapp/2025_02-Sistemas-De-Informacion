import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Order {
  order_ID: number;
  total_price: number;
  order_date: string;
  status: string;
  street?: string;
  region?: string;
  commune?: string;
  postal_code?: string;
  notes?: string;
  items: Array<{
    product_name: string;
    brand_name: string;
    color_name: string;
    size: string;
    quantity: number;
    price: number;
    image_url: string;
  }>;
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${backendUrl}/my-orders`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cargar pedidos");
      }

      const data = await response.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4" />
            Completado
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4" />
            Pendiente
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            No tienes pedidos aún
          </h2>
          <p className="text-gray-600 mb-8">
            Cuando realices tu primera compra, aparecerá aquí
          </p>
          <Link
            to="/productos"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis Pedidos</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.order_ID}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Encabezado del pedido */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  Pedido #{order.order_ID}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(order.order_date).toLocaleDateString("es-CL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>

                {/* Dirección de envío */}
                {(order.street ||
                  order.region ||
                  order.commune ||
                  (order.notes && !order.notes.includes("PayPal"))) && (
                  <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      📦 Dirección de Envío:
                    </p>
                    {order.street && (
                      <p className="text-xs text-blue-800">{order.street}</p>
                    )}
                    {order.commune && order.region && (
                      <p className="text-xs text-blue-800">
                        {order.commune}, {order.region}
                      </p>
                    )}
                    {order.postal_code && (
                      <p className="text-xs text-blue-800">
                        CP: {order.postal_code}
                      </p>
                    )}
                    {order.notes && order.notes.includes("|") && (
                      <p className="text-xs text-blue-800 mt-1 pt-1 border-t border-blue-300">
                        📝 {order.notes.split("|")[0].trim()}
                      </p>
                    )}
                    {order.notes &&
                      !order.notes.includes("|") &&
                      !order.notes.includes("PayPal") && (
                        <p className="text-xs text-blue-800 mt-1 pt-1 border-t border-blue-300">
                          📝 {order.notes}
                        </p>
                      )}
                  </div>
                )}

                {/* Método de pago */}
                {order.notes && order.notes.includes("PayPal") && (
                  <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-xs font-semibold text-green-900 mb-1">
                      💳 Método de Pago:
                    </p>
                    <p className="text-xs text-green-800">
                      {order.notes.includes("|")
                        ? order.notes.split("|")[1].trim()
                        : order.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {getStatusBadge(order.status)}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${Math.floor(order.total_price).toLocaleString("es-CL")}
                  </p>
                </div>
              </div>
            </div>

            {/* Items del pedido */}
            <div className="p-6 space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 pb-4 border-b border-gray-100 last:border-b-0"
                >
                  {/* Imagen */}
                  {item.image_url ? (
                    <img
                      src={item.image_url
                        .replace("../frontend/public", "")
                        .replace(/^\.\/+/, "/")}
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                      Sin imagen
                    </div>
                  )}

                  {/* Información */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.product_name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.brand_name}</p>
                    <p className="text-sm text-gray-600">
                      Color: {item.color_name} • Talla: {item.size}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cantidad: {item.quantity}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      $
                      {Math.floor(item.price * item.quantity).toLocaleString(
                        "es-CL"
                      )}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${Math.floor(item.price).toLocaleString("es-CL")} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
