import React, { useState } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import { useProductContext, ProductProvider } from "../context/ProductContext";
import { ProductModal } from "./ModifyProductModal";
import { useToast } from "../context/AlertaToast";

const ModifyProductInner: React.FC = () => {
  const {
    products,
    loading,
    selectProduct,
    categories,
    brands,
    suppliers,
    refreshProducts,
  } = useProductContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | "">("");
  const [filterBrand, setFilterBrand] = useState<number | "">("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  const handleEditProduct = async (productId: number) => {
    await selectProduct(productId);
    setIsModalOpen(true);
  };

  const handleToggleActiveProduct = async (
    product_ID: number,
    currentState: boolean
  ) => {
    try {
      const res = await fetch(`${backendUrl}/products/${product_ID}/active`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: !currentState }),
      });

      if (!res.ok) throw new Error("Error al actualizar estado");

      await refreshProducts();

      showToast("Estado actualizado correctamente", "success");
    } catch (err) {
      showToast("No se pudo cambiar el estado del producto", "error");
    }
  };

  const handleDeleteProduct = async (
    productId: number,
    productName: string
  ) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el producto "${productName}"?\n\nEsta acción no se puede deshacer y eliminará todas sus variantes e imágenes.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${backendUrl}/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar producto");

      showToast("Producto eliminado exitosamente", "success");
      await refreshProducts();
    } catch (err) {
      showToast("No se pudo eliminar el producto", "error");
    }
  };

  // Filtrar productos según búsqueda y filtros
  const filteredProducts = products.filter((product) => {
    // Filtro de búsqueda (nombre)
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filtro de categoría
    const matchesCategory =
      filterCategory === "" || product.category_ID === filterCategory;

    // Filtro de marca
    const matchesBrand = filterBrand === "" || product.brand_id === filterBrand;

    // Filtro de estado
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && product.is_active) ||
      (filterStatus === "inactive" && !product.is_active);

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCategory("");
    setFilterBrand("");
    setFilterStatus("all");
  };

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          🛍️ Panel de Administración de Productos
        </h1>
        <p className="text-gray-500 mt-2 text-lg">
          Gestiona y modifica los productos de tu tienda fácilmente
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Buscar producto
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro de categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📂 Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {categories.map((cat) => (
                <option key={cat.category_ID} value={cat.category_ID}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏷️ Marca
            </label>
            <select
              value={filterBrand}
              onChange={(e) =>
                setFilterBrand(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas</option>
              {brands.map((brand) => (
                <option key={brand.brand_id} value={brand.brand_id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segunda fila de filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Filtro de estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "all" | "active" | "inactive")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

          {/* Botón limpiar filtros */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              🔄 Limpiar filtros
            </button>
          </div>

          {/* Contador de resultados */}
          <div className="md:col-span-2 flex items-end justify-end">
            <p className="text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold">{filteredProducts.length}</span>{" "}
              de <span className="font-semibold">{products.length}</span>{" "}
              productos
            </p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className=" bg-blue-100">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  Imagen
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Marca
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">
                  Var.
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">
                  Proveedor
                </th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No se encontraron productos con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  return (
                    <tr key={product.product_ID}>
                      <td className="px-3 py-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {product.main_image ? (
                            <img
                              src={product.main_image
                                .replace("../frontend/public", "")
                                .replace(/^\.\/+/, "/")}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">{product.name}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 hidden md:table-cell">
                        {categories.find(
                          (c) => c.category_ID === product.category_ID
                        )?.name || "Sin categoría"}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 hidden lg:table-cell">
                        {brands.find((b) => b.brand_id === product.brand_id)
                          ?.name || "-"}
                      </td>
                      <td className="px-3 py-4 text-center text-sm">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {product.variants?.length || 0}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-700 hidden xl:table-cell">
                        <div className="max-w-xs truncate">
                          {suppliers.find(
                            (s) => s.supplier_ID === product.supplier_ID
                          )?.name || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <button
                          onClick={() =>
                            handleToggleActiveProduct(
                              product.product_ID,
                              product.is_active
                            )
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            product.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.is_active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleEditProduct(product.product_ID)
                            }
                            className="inline-flex items-center px-2 py-1.5 bg-blue-500 text-white text-xs font-medium rounded-lg hover:bg-blue-600 transition-all"
                            title="Editar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProduct(
                                product.product_ID,
                                product.name
                              )
                            }
                            className="inline-flex items-center px-2 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-all"
                            title="Eliminar"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export const ModifyProduct: React.FC = () => (
  <ProductProvider>
    <ModifyProductInner />
  </ProductProvider>
);
