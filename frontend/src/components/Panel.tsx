import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AddCategory from "./AddCategory";
import AddBrand from "./AddBrand";
import AddColor from "./AddColor";

interface PanelAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  isAvailable: boolean;
  category: "products" | "catalog" | "users" | "orders" | "reports";
}
export default function AdminPanelForm() {
  const navigate = useNavigate();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isColorModalOpen, setIsColorModalOpen] = useState(false);

  const panelActions: PanelAction[] = [
    {
      id: "add-product",
      title: "Añadir Producto",
      description: "Crear un nuevo producto en el catálogo",
      icon: "➕",
      onClick: () => navigate("/add-product"),
      isAvailable: true,
      category: "products",
    },
    {
      id: "modify-product",
      title: "Modificar Producto",
      description: "Editar productos existentes y sus variantes",
      icon: "✏️",
      onClick: () => navigate("/modify-product"),
      isAvailable: true,
      category: "products",
    },
    {
      id: "manage-users",
      title: "Administrar Usuarios",
      description: "Gestionar usuarios del sistema",
      icon: "👥",
      onClick: () => navigate("/manage-users"),
      isAvailable: true,
      category: "users",
    },
    {
      id: "manage-suppliers",
      title: "Administrar Proveedores",
      description: "Gestionar proveedores de los productos de tu tienda",
      icon: "🚚",
      onClick: () => navigate("/manage-suppliers"),
      isAvailable: true,
      category: "users",
    },
    {
      id: "add-category",
      title: "Añadir Categoría",
      description: "Crear nuevas categorías de productos",
      icon: "📁",
      onClick: () => setIsCategoryModalOpen(true),
      isAvailable: true,
      category: "catalog",
    },
    {
      id: "add-brand",
      title: "Añadir Marca",
      description: "Agregar nuevas marcas al sistema",
      icon: "🏷️",
      onClick: () => setIsBrandModalOpen(true),
      isAvailable: true,
      category: "catalog",
    },
    {
      id: "add-color",
      title: "Añadir Color",
      description: "Definir nuevos colores disponibles",
      icon: "🎨",
      onClick: () => setIsColorModalOpen(true),
      isAvailable: true,
      category: "catalog",
    },
    {
      id: "manage-orders",
      title: "Gestionar Pedidos",
      description: "Ver y administrar todos los pedidos de la tienda",
      icon: "📦",
      onClick: () => navigate("/manage-orders"),
      isAvailable: true,
      category: "orders",
    },
    {
      id: "dashboard",
      title: "Reportes y Estadísticas",
      description: "Ver métricas, ventas y estadísticas de la tienda",
      icon: "📊",
      onClick: () => navigate("/dashboard"),
      isAvailable: true,
      category: "reports",
    },
  ];

  const categories = {
    products: { title: "Gestión de Productos", color: "blue" },
    catalog: { title: "Catálogo", color: "green" },
    users: { title: "Usuarios", color: "purple" },
    orders: { title: "Pedidos", color: "red" },
    reports: { title: "Reportes", color: "indigo" },
  };

  const borderColorClasses: Record<string, string> = {
    blue: "border-l-blue-500",
    green: "border-l-green-500",
    purple: "border-l-purple-500",
    red: "border-l-red-500",
    yellow: "border-l-yellow-500",
    indigo: "border-l-indigo-500",
    orange: "border-l-orange-500",
  };

  const bgColorClasses: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    indigo: "bg-indigo-500",
    orange: "bg-orange-500",
  };

  const getCategoryActions = (category: keyof typeof categories) =>
    panelActions.filter((action) => action.category === category);

  const ActionCard = ({ action }: { action: PanelAction }) => (
    <div
      className={`
        bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 
        p-6 border-l-4 cursor-pointer transform hover:-translate-y-1
        ${
          action.isAvailable
            ? `${
                borderColorClasses[categories[action.category].color]
              } hover:bg-gray-50`
            : "border-l-gray-300 opacity-60 cursor-not-allowed"
        }
      `}
      onClick={action.onClick}
      role="button"
      tabIndex={action.isAvailable ? 0 : -1}
      aria-label={action.description}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          action.onClick();
        }
      }}
    >
      <div className="flex items-start space-x-4">
        <div className="text-3xl">{action.icon}</div>
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold mb-2 ${
              action.isAvailable ? "text-gray-800" : "text-gray-500"
            }`}
          >
            {action.title}
          </h3>
          <p
            className={`text-sm ${
              action.isAvailable ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {action.description}
          </p>
          {!action.isAvailable && (
            <span className="inline-block mt-2 px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
              Próximamente
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Panel de Control
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestiona tu tienda desde este panel centralizado. Organiza
            productos, categorías y usuarios de manera eficiente.
          </p>
        </div>

        {/* Action Categories */}
        <div className="space-y-12">
          {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
            const categoryActions = getCategoryActions(
              categoryKey as keyof typeof categories
            );

            return (
              <section key={categoryKey} className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-1 h-8 ${
                      bgColorClasses[categoryInfo.color]
                    } rounded-full`}
                  ></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {categoryInfo.title}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Category Management Modal */}
      <AddCategory
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Brand Management Modal */}
      <AddBrand
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Color Management Modal */}
      <AddColor
        isOpen={isColorModalOpen}
        onClose={() => setIsColorModalOpen(false)}
      />
    </div>
  );
}
