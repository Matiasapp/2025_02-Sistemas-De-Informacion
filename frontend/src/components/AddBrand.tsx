import { useState, useEffect } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Brand = {
  brand_id: number;
  name: string;
};

interface AddBrandProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddBrand({ isOpen, onClose }: AddBrandProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBrandName, setNewBrandName] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Brand | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchBrands();
    }
  }, [isOpen]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/brands`);
      if (!res.ok) throw new Error("Error al cargar marcas");
      const data = await res.json();
      setBrands(data);
      setError("");
    } catch (err) {
      setError("Error al cargar las marcas");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setError("El nombre de la marca es requerido");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${backendUrl}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBrandName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear la marca");
      }

      setNewBrandName("");
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || "Error al crear la marca");
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setEditName(brand.name);
    setError("");
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditName("");
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand || !editName.trim()) {
      setError("El nombre de la marca es requerido");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${backendUrl}/brands/${editingBrand.brand_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar la marca");
      }

      setEditingBrand(null);
      setEditName("");
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || "Error al actualizar la marca");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBrand = async () => {
    if (!deleteConfirm) return;

    try {
      setDeleting(true);
      setError("");
      const res = await fetch(
        `${backendUrl}/brands/${deleteConfirm.brand_id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al eliminar la marca");
      }

      setDeleteConfirm(null);
      await fetchBrands();
    } catch (err: any) {
      setError(err.message || "Error al eliminar la marca");
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Gestión de Marcas
                </h2>
                <p className="text-purple-100 mt-1">
                  Agrega, modifica o elimina marcas de productos
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Add New Brand */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Agregar Nueva Marca
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Nombre de la marca..."
                  value={newBrandName}
                  onChange={(e) => {
                    setNewBrandName(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddBrand();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddBrand}
                  disabled={saving || !newBrandName.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      Agregar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Brands List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Marcas Existentes ({brands.length})
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Cargando marcas...</p>
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay marcas registradas</p>
                  <p className="text-sm mt-1">
                    Agrega una nueva marca usando el formulario de arriba
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <div
                      key={brand.brand_id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {editingBrand?.brand_id === brand.brand_id ? (
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateBrand();
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateBrand}
                            disabled={saving}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800 font-medium">
                            {brand.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(brand)}
                              className="text-blue-600 hover:text-blue-700 px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(brand)}
                              className="text-red-600 hover:text-red-700 px-3 py-1 rounded transition-colors duration-200 flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[110] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ¿Eliminar marca?
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Esta acción no se puede deshacer. Se eliminará permanentemente
                  la marca
                  <strong> "{deleteConfirm.name}"</strong>.
                  {error && error.includes("usada por") && (
                    <span className="block mt-2 text-red-600">{error}</span>
                  )}
                </p>
                {error && !error.includes("usada por") && (
                  <p className="text-sm text-red-600 mb-4">{error}</p>
                )}
                <div className="flex gap-3 justify-center">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                    onClick={() => {
                      setDeleteConfirm(null);
                      setError("");
                    }}
                    disabled={deleting}
                  >
                    Cancelar
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleDeleteBrand}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Eliminando...
                      </>
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
