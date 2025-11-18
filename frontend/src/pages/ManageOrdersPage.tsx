import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBagIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface Order {
  order_ID: number;
  user_ID: number;
  rut: string;
  user_name: string;
  user_email: string;
  phone: string;
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

export function ManageOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${backendUrl}/admin/orders`, {
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

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(
        `${backendUrl}/admin/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar estado");
      }

      // Actualizar la lista
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_ID === orderId ? { ...order, status: newStatus } : order
        )
      );

      alert("Estado actualizado correctamente");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pagado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4" />
            Pagado
          </span>
        );
      case "pendiente":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4" />
            Pendiente
          </span>
        );
      case "enviado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <TruckIcon className="h-4 w-4" />
            Enviado
          </span>
        );
      case "entregado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircleIcon className="h-4 w-4" />
            Entregado
          </span>
        );
      case "cancelado":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4" />
            Cancelado
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

  const filteredOrders = orders.filter((order) => {
    // Filtro por estado
    const statusMatch = filterStatus === "all" || order.status === filterStatus;

    // Filtro por búsqueda (RUT, nombre, email, ID de pedido, región, comuna)
    const searchLower = searchTerm.toLowerCase();
    const searchMatch =
      searchTerm === "" ||
      order.order_ID.toString().includes(searchTerm) ||
      order.rut.toLowerCase().includes(searchLower) ||
      order.user_name.toLowerCase().includes(searchLower) ||
      order.user_email.toLowerCase().includes(searchLower) ||
      order.phone?.toLowerCase().includes(searchLower) ||
      order.region?.toLowerCase().includes(searchLower) ||
      order.commune?.toLowerCase().includes(searchLower) ||
      order.street?.toLowerCase().includes(searchLower);

    return statusMatch && searchMatch;
  });

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
            to="/control-panel"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Pedidos</h1>
        <Link
          to="/control-panel"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Volver al panel
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por RUT, nombre, email, teléfono, ID pedido, región, comuna o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              Limpiar
            </button>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mostrando {filteredOrders.length} de {orders.length} pedidos
        </p>
      </div>

      {/* Filtros por estado */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Filtrar por estado:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus("pendiente")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "pendiente"
                ? "bg-yellow-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pendientes ({orders.filter((o) => o.status === "pendiente").length})
          </button>
          <button
            onClick={() => setFilterStatus("pagado")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "pagado"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pagados ({orders.filter((o) => o.status === "pagado").length})
          </button>
          <button
            onClick={() => setFilterStatus("enviado")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "enviado"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Enviados ({orders.filter((o) => o.status === "enviado").length})
          </button>
          <button
            onClick={() => setFilterStatus("entregado")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "entregado"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Entregados ({orders.filter((o) => o.status === "entregado").length})
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <ShoppingBagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No hay pedidos con este filtro</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.order_ID}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Encabezado del pedido */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      Pedido #{order.order_ID}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {order.user_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      RUT: {order.rut} • Email: {order.user_email}
                    </p>
                    {order.phone && (
                      <p className="text-xs text-gray-600">
                        Tel: {order.phone}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.order_date).toLocaleDateString("es-CL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
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
                          <p className="text-xs text-blue-800">
                            {order.street}
                          </p>
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
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold text-gray-900">
                        ${Math.floor(order.total_price).toLocaleString("es-CL")}
                      </p>
                    </div>
                    <div>
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order.order_ID, e.target.value)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="pagado">Pagado</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
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
      )}
    </div>
  );
}
