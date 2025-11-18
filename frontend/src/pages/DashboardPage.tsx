import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

interface TopProduct {
  product_ID: number;
  product_name: string;
  product_image: string;
  brand_name: string;
  total_sold: number;
  total_revenue: number;
}

interface SalesByPeriod {
  date: string;
  orders_count: number;
  daily_revenue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface LowStockProduct {
  product_ID: number;
  product_name: string;
  product_image: string;
  brand_name: string;
  supplier_name: string;
  supplier_phone: string;
  variant_id: number;
  size: string;
  color_name: string;
  stock: number;
}

interface SalesByRegion {
  region: string;
  orders_count: number;
  total_revenue: number;
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [salesByPeriod, setSalesByPeriod] = useState<SalesByPeriod[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [salesByRegion, setSalesByRegion] = useState<SalesByRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodDays, setPeriodDays] = useState(30);

  useEffect(() => {
    fetchDashboardData();
  }, [periodDays]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        metricsRes,
        topProductsRes,
        salesPeriodRes,
        statusRes,
        lowStockRes,
        regionRes,
      ] = await Promise.all([
        fetch(`${backendUrl}/admin/reports/dashboard`, {
          credentials: "include",
        }),
        fetch(`${backendUrl}/admin/reports/top-products?limit=5`, {
          credentials: "include",
        }),
        fetch(
          `${backendUrl}/admin/reports/sales-by-period?days=${periodDays}`,
          {
            credentials: "include",
          }
        ),
        fetch(`${backendUrl}/admin/reports/orders-by-status`, {
          credentials: "include",
        }),
        fetch(`${backendUrl}/admin/reports/low-stock?threshold=10`, {
          credentials: "include",
        }),
        fetch(`${backendUrl}/admin/reports/sales-by-region`, {
          credentials: "include",
        }),
      ]);

      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (topProductsRes.ok) setTopProducts(await topProductsRes.json());
      if (salesPeriodRes.ok) setSalesByPeriod(await salesPeriodRes.json());
      if (statusRes.ok) setOrdersByStatus(await statusRes.json());
      if (lowStockRes.ok) setLowStock(await lowStockRes.json());
      if (regionRes.ok) setSalesByRegion(await regionRes.json());
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente: "bg-yellow-100 text-yellow-800",
      pagado: "bg-blue-100 text-blue-800",
      enviado: "bg-purple-100 text-purple-800",
      entregado: "bg-green-100 text-green-800",
      cancelado: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendiente: "Pendiente",
      pagado: "Pagado",
      enviado: "Enviado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Dashboard de Reportes
              </h1>
              <p className="text-gray-600 mt-2">
                Estadísticas y métricas de tu tienda
              </p>
            </div>
            <button
              onClick={() => navigate("/control-panel")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              ← Volver al Panel
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Ingresos */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">
                    Ingresos Totales
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(metrics.totalRevenue)}
                  </p>
                  <p className="text-green-100 text-xs mt-2">
                    {metrics.totalOrders} pedidos
                  </p>
                </div>
                <div className="text-5xl opacity-80">💰</div>
              </div>
            </div>

            {/* Ingresos del Mes */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">
                    Ingresos del Mes
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(metrics.monthlyRevenue)}
                  </p>
                  <p className="text-blue-100 text-xs mt-2">
                    {metrics.monthlyOrders} pedidos
                  </p>
                </div>
                <div className="text-5xl opacity-80">📈</div>
              </div>
            </div>

            {/* Total Productos */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium mb-1">
                    Total Productos
                  </p>
                  <p className="text-3xl font-bold">{metrics.totalProducts}</p>
                  <p className="text-purple-100 text-xs mt-2">
                    {metrics.lowStockProducts} con stock bajo
                  </p>
                </div>
                <div className="text-5xl opacity-80">📦</div>
              </div>
            </div>

            {/* Total Usuarios */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium mb-1">
                    Usuarios Registrados
                  </p>
                  <p className="text-3xl font-bold">{metrics.totalUsers}</p>
                  <p className="text-orange-100 text-xs mt-2">
                    {metrics.pendingOrders} pedidos pendientes
                  </p>
                </div>
                <div className="text-5xl opacity-80">👥</div>
              </div>
            </div>
          </div>
        )}

        {/* Gráfica de Ventas por Período */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Ventas por Período
            </h2>
            <select
              value={periodDays}
              onChange={(e) => setPeriodDays(Number(e.target.value))}
              className="border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={7}>Últimos 7 días</option>
              <option value={30}>Últimos 30 días</option>
              <option value={90}>Últimos 90 días</option>
            </select>
          </div>

          {salesByPeriod.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Fecha
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Pedidos
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Ingresos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesByPeriod.map((day, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        {new Date(day.date).toLocaleDateString("es-CL", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-700">
                        {day.orders_count}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(day.daily_revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No hay datos de ventas en este período
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Productos */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Productos Más Vendidos
            </h2>
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div
                    key={product.product_ID}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <img
                      src={`${product.product_image}`
                        .replace("../frontend/public", "")
                        .replace(/^\.\/+/, "/")}
                      alt={product.product_name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {product.product_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {product.brand_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">
                        {product.total_sold} vendidos
                      </p>
                      <p className="text-sm text-green-600 font-semibold">
                        {formatCurrency(product.total_revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No hay productos vendidos aún
              </p>
            )}
          </div>

          {/* Pedidos por Estado */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Distribución de Pedidos
            </h2>
            {ordersByStatus.length > 0 ? (
              <div className="space-y-3">
                {ordersByStatus.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">
                          {item.count}
                        </p>
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{
                            width: `${
                              (item.count /
                                ordersByStatus.reduce(
                                  (a, b) => a + b.count,
                                  0
                                )) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No hay pedidos registrados
              </p>
            )}
          </div>
        </div>

        {/* Stock Bajo */}
        {lowStock.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              ⚠️ Productos con Stock Bajo
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Producto
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Marca
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Variante
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Proveedor
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Teléfono
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((item) => (
                    <tr
                      key={item.variant_id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`${item.product_image}`
                              .replace("../frontend/public", "")
                              .replace(/^\.\/+/, "/")}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <span className="font-medium text-gray-800">
                            {item.product_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.brand_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.color_name} - Talla {item.size}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.supplier_name}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {item.supplier_phone}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            item.stock === 0
                              ? "bg-red-100 text-red-800"
                              : item.stock < 5
                              ? "bg-orange-100 text-orange-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.stock} unidades
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ventas por Región */}
        {salesByRegion.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Ventas por Región
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {salesByRegion.slice(0, 6).map((region) => (
                <div
                  key={region.region}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {region.region}
                  </h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-gray-600">
                        {region.orders_count} pedidos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(region.total_revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
