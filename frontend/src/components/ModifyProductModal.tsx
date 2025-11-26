import React, { useEffect, useState, useRef } from "react";
import { useProductContext } from "../context/ProductContext";
import { useToast } from "../context/AlertaToast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import type { Variant } from "../types/types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const {
    selectedProduct,
    setSelectedProduct,
    variants,
    setVariants,
    saveProduct,
    deleteProduct,
    saving,
    deleting,
    colors,
    categories,
    brands,
    suppliers,
  } = useProductContext();

  // Local editable copies so cancel doesn't mutate global state
  const [localProduct, setLocalProduct] = useState<
    typeof selectedProduct | null
  >(null);
  const [localVariants, setLocalVariants] = useState<Variant[]>([]);
  const descRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustTextarea = () => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const [showAddModal, setShowAddModal] = useState(false);
  const [addColorId, setAddColorId] = useState<number>(
    colors[0]?.color_ID ?? 0
  );
  const [addQuantity, setAddQuantity] = useState<number>(1);

  useEffect(() => {
    if (isOpen && selectedProduct) {
      // Deep copy minimal fields
      setLocalProduct(JSON.parse(JSON.stringify(selectedProduct)));
      // Deep copy variants including images array to avoid reference sharing
      // Asegurar que todas las variantes tengan un tempId si no tienen variant_id
      setLocalVariants(
        (variants || []).map((v) => ({
          ...v,
          tempId:
            v.variant_id !== undefined
              ? undefined
              : v.tempId || crypto.randomUUID(),
          images: (v.images || []).map((img) => ({ ...img })),
        }))
      );
    } else {
      setLocalProduct(null);
      setLocalVariants([]);
    }
  }, [isOpen, selectedProduct, variants]);

  // adjust textarea height when description changes or modal opens
  useEffect(() => {
    adjustTextarea();
  }, [localProduct?.description, isOpen]);

  if (!isOpen || !selectedProduct || !localProduct) return null;

  // Definir tallas según categoría
  const SIZES_TOP = ["XS", "S", "M", "L", "XL", "2XL"]; // Poleras, Polerones, Camisas
  const SIZES_BOTTOM = ["28", "30", "32", "34", "36", "38", "40"]; // Pantalones, Jeans, Shorts

  const selectedCategory = categories.find(
    (c) => c.category_ID === localProduct?.category_ID
  );

  const SIZES =
    selectedCategory?.size_type === "numeric" ? SIZES_BOTTOM : SIZES_TOP;

  // Función para generar SKU automáticamente
  const generateSKU = (brandId: number, colorId: number, size: string) => {
    if (!brandId || !colorId || !size) return "";

    const brandName = brands.find((b) => b.brand_id === brandId)?.name || "";
    const colorName = colors.find((c) => c.color_ID === colorId)?.name || "";

    // Prefijos limpiados
    const b = brandName.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "BRD";
    const c = colorName.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "CLR";
    const s = size.replace(/\s+/g, "").toUpperCase();

    return `${b}-${c}-${s}`;
  };

  const handleAddVariant = () => {
    // open small modal to choose color and quantity
    setAddColorId(colors[0]?.color_ID ?? 0);
    setAddQuantity(1);
    setShowAddModal(true);
  };

  const confirmAddVariants = () => {
    // Calcular tallas disponibles para el color seleccionado
    const usedSizesForColor = localVariants
      .filter((v) => v.color_ID === Number(addColorId))
      .map((v) => v.size);

    const availableSizes = SIZES.filter((s) => !usedSizesForColor.includes(s));

    // Limitar la cantidad a agregar según las tallas disponibles
    const maxToAdd = availableSizes.length;
    const actualQuantity = Math.min(addQuantity || 0, maxToAdd);

    if (actualQuantity === 0) {
      showToast("No hay más tallas disponibles para este color", "warning");
      setShowAddModal(false);
      return;
    }

    if (actualQuantity < (addQuantity || 0)) {
      showToast(
        `Solo se pueden agregar ${actualQuantity} variante(s) para este color`,
        "warning"
      );
    }

    const toAdd: Variant[] = [];
    for (let i = 0; i < actualQuantity; i++) {
      toAdd.push({
        tempId: crypto.randomUUID(),
        isNew: true,
        color_ID: Number(addColorId),
        size: "",
        price: 0,
        stock: 0,
        is_active: true,
        sku: "",
        images: [],
      } as Variant);
    }
    setLocalVariants((prev) => [...prev, ...toAdd]);
    setShowAddModal(false);
  };

  const handleVariantChange = (
    id: number | string,
    key: keyof Variant,
    value: any
  ) => {
    setLocalVariants((prev) =>
      prev.map((v) => {
        // Crear un ID único consistente para la comparación
        const variantKey =
          v.variant_id !== undefined ? String(v.variant_id) : v.tempId;
        const passedKey = String(id);

        if (variantKey === passedKey) {
          const updated = { ...v, [key]: value };

          // Si cambia el color o la talla, regenerar SKU automáticamente
          if (key === "color_ID" || key === "size") {
            const newColorId = key === "color_ID" ? value : v.color_ID;
            const newSize = key === "size" ? value : v.size;
            updated.sku = generateSKU(
              localProduct.brand_id,
              newColorId,
              newSize
            );
          }

          return updated;
        }
        return v;
      })
    );
  };

  const handleRemoveVariant = (id: number | string) => {
    setLocalVariants((prev) =>
      prev.filter((v) => {
        const variantKey =
          v.variant_id !== undefined ? String(v.variant_id) : v.tempId;
        const passedKey = String(id);
        return variantKey !== passedKey;
      })
    );
  };

  // Group variants by color and collect images for each color (plain compute to avoid hook-order issues)
  const groupsByColor = (() => {
    const map = new Map<
      number,
      { colorId: number; variants: Variant[]; images: any[] }
    >();
    localVariants.forEach((v) => {
      const colorId = v.color_ID || 0;
      if (!map.has(colorId))
        map.set(colorId, { colorId, variants: [], images: [] });
      const entry = map.get(colorId)!;
      entry.variants.push(v);
      (v.images || []).forEach((img: any) => {
        // use image_id if present, otherwise tempId, url or filename as key
        const key = img.image_id ?? img.tempId ?? img.url ?? img.file?.name;
        if (
          !entry.images.find(
            (x: any) => (x.key ?? x.image_id ?? x.tempId ?? x.url) === key
          )
        ) {
          entry.images.push({ ...img, key });
        }
      });
    });
    return Array.from(map.values());
  })();

  const handleSelectMainImage = (
    colorId: number,
    imageKey: string | number
  ) => {
    setLocalVariants((prev) =>
      prev.map((v) => {
        if (v.color_ID !== colorId) return v;
        const images = (v.images || []).map((img) => {
          const key = img.image_id ?? img.tempId ?? img.url ?? img.file?.name;
          return { ...img, is_main: key === imageKey };
        });
        return { ...v, images };
      })
    );

    // If the selected image exists in DB (has image_id), notify backend to update is_main
    (async () => {
      try {
        // find the image object in current localVariants snapshot
        const found = localVariants
          .flatMap((v) => v.images || [])
          .find((img: any) => {
            const key = img.image_id ?? img.tempId ?? img.url ?? img.file?.name;
            return key === imageKey;
          });

        if (found && found.image_id) {
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          await fetch(`${backendUrl}/update-image-main`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ image_id: found.image_id, is_main: 1 }),
          });
        }
      } catch (err) {}
    })();
  };

  const handleSave = async () => {
    if (!localProduct) return;

    // Validar que cada color tenga al menos una imagen principal
    const colorIds = new Set(localVariants.map((v) => v.color_ID));
    const missingMainImages: number[] = [];

    for (const colorId of colorIds) {
      // Obtener todas las imágenes de este color
      const variantsWithColor = localVariants.filter(
        (v) => v.color_ID === colorId
      );
      const allImagesForColor: any[] = [];

      variantsWithColor.forEach((v) => {
        (v.images || []).forEach((img) => {
          const key = img.image_id ?? img.tempId ?? img.url ?? img.file?.name;
          if (
            !allImagesForColor.find(
              (x) => (x.key ?? x.image_id ?? x.tempId ?? x.url) === key
            )
          ) {
            allImagesForColor.push({ ...img, key });
          }
        });
      });

      // Verificar si hay al menos una imagen marcada como principal
      const hasMainImage = allImagesForColor.some(
        (img) => img.is_main === true || img.is_main === 1
      );

      if (allImagesForColor.length > 0 && !hasMainImage) {
        missingMainImages.push(colorId);
      }
    }

    if (missingMainImages.length > 0) {
      const colorNames = missingMainImages
        .map(
          (id) => colors.find((c) => c.color_ID === id)?.name || `Color ${id}`
        )
        .join(", ");

      showToast(
        `⚠️ Debes seleccionar una imagen principal para los siguientes colores: ${colorNames}`,
        "error"
      );
      return;
    }

    // Validar si el color principal seleccionado tiene imágenes
    if (localProduct.main_color_ID) {
      const mainColorVariants = localVariants.filter(
        (v) => v.color_ID === localProduct.main_color_ID
      );
      const mainColorImages: any[] = [];

      mainColorVariants.forEach((v) => {
        (v.images || []).forEach((img) => {
          const key = img.image_id ?? img.tempId ?? img.url ?? img.file?.name;
          if (
            !mainColorImages.find(
              (x) => (x.key ?? x.image_id ?? x.tempId ?? x.url) === key
            )
          ) {
            mainColorImages.push({ ...img, key });
          }
        });
      });

      if (mainColorImages.length === 0) {
        const mainColorName =
          colors.find((c) => c.color_ID === localProduct.main_color_ID)?.name ||
          "seleccionado";
        const confirmed = confirm(
          `⚠️ El color principal "${mainColorName}" no tiene imágenes.\n\n` +
            `Se mostrará un placeholder en la tienda hasta que agregues imágenes para este color.\n\n` +
            `¿Deseas continuar de todos modos?`
        );

        if (!confirmed) {
          return;
        }
      }
    }

    console.log(
      "localVariants antes de guardar:",
      localVariants.map((v) => ({
        variant_id: v.variant_id,
        tempId: v.tempId,
        color_ID: v.color_ID,
        size: v.size,
      }))
    );

    // Pass local data directly to saveProduct instead of updating context first
    await saveProduct(localProduct, localVariants);
    onClose();
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    await deleteProduct(selectedProduct.product_ID!);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 pt-4 pb-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden mx-4">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Modificar Producto
                </h2>
                <p className="text-blue-100 text-sm">
                  Edita la información y variantes del producto
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
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

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-6 bg-gray-50">
          {/* Información Básica */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Producto
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={localProduct.name}
                  onChange={(e) =>
                    setLocalProduct({ ...localProduct, name: e.target.value })
                  }
                  placeholder="Ej: Zapatillas deportivas"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Género
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  value={localProduct.gender ?? ""}
                  onChange={(e) =>
                    setLocalProduct({
                      ...localProduct,
                      gender: e.target.value as "Hombre" | "Mujer" | "Unisex",
                    })
                  }
                >
                  <option value="">Seleccione género</option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  value={localProduct.category_ID ?? ""}
                  onChange={(e) =>
                    setLocalProduct({
                      ...localProduct,
                      category_ID: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Seleccione categoría</option>
                  {categories?.map((c: any) => (
                    <option key={c.category_ID} value={c.category_ID}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Marca
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  value={localProduct.brand_id ?? ""}
                  onChange={(e) =>
                    setLocalProduct({
                      ...localProduct,
                      brand_id: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Seleccione marca</option>
                  {brands?.map((b: any) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Proveedor
                </label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                  value={localProduct.supplier_ID ?? ""}
                  onChange={(e) =>
                    setLocalProduct({
                      ...localProduct,
                      supplier_ID: Number(e.target.value),
                    })
                  }
                >
                  <option value="">Seleccione proveedor</option>
                  {suppliers?.map((s: any) => (
                    <option key={s.supplier_ID} value={s.supplier_ID}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                ref={(el) => {
                  if (el) descRef.current = el;
                }}
                onInput={() => adjustTextarea()}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none overflow-hidden"
                value={localProduct.description}
                onChange={(e) =>
                  setLocalProduct({
                    ...localProduct,
                    description: e.target.value,
                  })
                }
                rows={3}
                placeholder="Describe las características del producto..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color a mostrar en página principal
              </label>
              {(() => {
                const colorIds = Array.from(
                  new Set(localVariants.map((v) => v.color_ID))
                );
                if (colorIds.length === 0) {
                  return (
                    <select
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 bg-gray-100"
                      disabled
                    >
                      <option>No hay colores (añade variantes)</option>
                    </select>
                  );
                }

                return (
                  <select
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    value={
                      colorIds.includes(localProduct.main_color_ID as number)
                        ? localProduct.main_color_ID
                        : colorIds[0]
                    }
                    onChange={(e) =>
                      setLocalProduct({
                        ...localProduct,
                        main_color_ID: Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Seleccione color</option>
                    {colorIds.map((colorId) => (
                      <option key={colorId} value={colorId}>
                        {colors.find((c) => c.color_ID === colorId)?.name ||
                          colorId}
                      </option>
                    ))}
                  </select>
                );
              })()}

              {localVariants.find(
                (v) => v.color_ID === localProduct.main_color_ID
              ) &&
                !localVariants
                  .filter((v) => v.color_ID === localProduct.main_color_ID)
                  .some((v) => v.images && v.images.length > 0) && (
                  <div className="mt-2 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                    <div className="flex">
                      <svg
                        className="w-5 h-5 text-yellow-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p className="text-sm text-yellow-700">
                        El color seleccionado no tiene imágenes. Se mostrará un
                        placeholder en la página principal.
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Sección de Variantes */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                  />
                </svg>
                Variantes del Producto
              </h3>
              <button
                onClick={handleAddVariant}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2"
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Añadir Variante
              </button>
            </div>

            <div className="space-y-4">
              {groupsByColor.map((group) => (
                <div
                  key={group.colorId}
                  className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      <span className="text-blue-600 mr-2">●</span>
                      {colors.find((c) => c.color_ID === group.colorId)?.name ||
                        `Color ${group.colorId}`}
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {group.variants.map((v, idx) => {
                      // Generar una key única y estable
                      const variantKey =
                        v.variant_id !== undefined
                          ? `variant-${v.variant_id}`
                          : v.tempId
                          ? `temp-${v.tempId}`
                          : `fallback-${group.colorId}-${idx}`;

                      return (
                        <div
                          key={variantKey}
                          className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Talla
                              </label>
                              <select
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                value={v.size}
                                onChange={(e) =>
                                  handleVariantChange(
                                    v.variant_id ?? v.tempId!,
                                    "size",
                                    e.target.value
                                  )
                                }
                                required
                              >
                                <option value="">Seleccionar...</option>
                                {SIZES.filter((s) => {
                                  // Mostrar la talla actual de esta variante
                                  if (s === v.size) return true;
                                  // Ocultar tallas ya usadas en OTRAS variantes del mismo color
                                  const usedByOther = localVariants.some(
                                    (other) =>
                                      other.color_ID === v.color_ID &&
                                      other.size === s &&
                                      (other.variant_id !== v.variant_id ||
                                        other.tempId !== v.tempId)
                                  );
                                  return !usedByOther;
                                }).map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Precio ($)
                              </label>
                              <input
                                type="number"
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={v.price}
                                onChange={(e) => {
                                  const value = e.target.value.replace(
                                    /[.,]/g,
                                    ""
                                  );
                                  handleVariantChange(
                                    v.variant_id ?? v.tempId!,
                                    "price",
                                    Number(value)
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "." || e.key === ",") {
                                    e.preventDefault();
                                  }
                                }}
                                step="1"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                Stock
                              </label>
                              <input
                                type="number"
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={v.stock}
                                onChange={(e) =>
                                  handleVariantChange(
                                    v.variant_id ?? v.tempId!,
                                    "stock",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">
                                SKU
                              </label>
                              <input
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                                value={v.sku}
                                readOnly
                                placeholder="Auto-generado"
                              />
                            </div>
                          </div>

                          <div className="flex gap-3 justify-end mt-3 pt-3 border-t border-gray-200">
                            <button
                              onClick={async () => {
                                const newState = !v.is_active;
                                handleVariantChange(
                                  v.variant_id ?? v.tempId!,
                                  "is_active",
                                  newState
                                );

                                if (v.variant_id) {
                                  try {
                                    const res = await fetch(
                                      `${backendUrl}/variants/${v.variant_id}/active`,
                                      {
                                        method: "PUT",
                                        headers: {
                                          "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                          is_active: newState,
                                        }),
                                      }
                                    );
                                    const data = await res.json();
                                    if (data && data.message) {
                                    }
                                  } catch (err) {
                                    handleVariantChange(
                                      v.variant_id ?? v.tempId!,
                                      "is_active",
                                      !newState
                                    );
                                    showToast(
                                      "No se pudo cambiar el estado de la variante",
                                      "error"
                                    );
                                  }
                                }
                              }}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                v.is_active
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {v.is_active ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                )}
                              </svg>
                              {v.is_active ? "Activa" : "Inactiva"}
                            </button>

                            <button
                              onClick={() =>
                                handleRemoveVariant(v.variant_id ?? v.tempId!)
                              }
                              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all flex items-center gap-2"
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
                      );
                    })}

                    {/* Sección de imágenes */}
                    <div className="mt-4 bg-white rounded-lg p-4 border-2 border-dashed border-gray-300">
                      <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Imágenes del producto (haz clic para marcar como
                        principal)
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {group.images.map((img: any) => {
                          const key =
                            img.image_id ??
                            img.tempId ??
                            img.url ??
                            img.file?.name;
                          const isMain = img.is_main === true;
                          let src: string | undefined;
                          if (img.file) {
                            src = URL.createObjectURL(img.file);
                          } else if (img.url) {
                            src = img.url
                              .replace("../frontend/public", "")
                              .replace(/^\.\/+/, "/");
                          } else if (img.path) {
                            src = img.path
                              .replace("../frontend/public", "")
                              .replace(/^\.\/+/, "/");
                          }

                          const handleDeleteImage = async (
                            e: React.MouseEvent<HTMLButtonElement>
                          ) => {
                            e.stopPropagation(); // prevent selecting as main

                            // optimistic removal: remove image from localVariants
                            const imageKey = key;
                            const prev = JSON.parse(
                              JSON.stringify(localVariants)
                            );

                            setLocalVariants((prevVars) =>
                              prevVars.map((v) => {
                                if (v.color_ID !== group.colorId) return v;
                                return {
                                  ...v,
                                  images: (v.images || []).filter((im: any) => {
                                    const k =
                                      im.image_id ??
                                      im.tempId ??
                                      im.url ??
                                      im.file?.name;
                                    return k !== imageKey;
                                  }),
                                };
                              })
                            );

                            // If persisted on server, request deletion
                            try {
                              if (img.image_id) {
                                const res = await fetch(
                                  `${backendUrl}/product-images/${img.image_id}`,
                                  {
                                    method: "DELETE",
                                    credentials: "include",
                                  }
                                );
                                if (!res.ok) {
                                  throw new Error(
                                    "Server returned " + res.status
                                  );
                                }
                              }
                            } catch (err) {
                              // revert optimistic change
                              setLocalVariants(prev);
                              showToast(
                                "No se pudo eliminar la imagen en el servidor.",
                                "error"
                              );
                            }
                          };

                          return (
                            <div
                              key={key}
                              className={`relative rounded-lg overflow-hidden cursor-pointer transition-all ${
                                isMain
                                  ? "ring-4 ring-blue-500 shadow-lg scale-105"
                                  : "ring-2 ring-gray-200 hover:ring-blue-300"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectMainImage(group.colorId, key)
                                }
                                className="block w-24 h-24"
                              >
                                {src ? (
                                  <img
                                    src={src}
                                    alt="img"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <svg
                                      className="w-8 h-8 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                                {isMain && (
                                  <span className="absolute left-2 top-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                    Principal
                                  </span>
                                )}
                              </button>

                              {/* delete button (top-right) */}
                              <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="absolute right-2 bottom-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-all"
                                title="Eliminar imagen"
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
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            </div>
                          );
                        })}
                        {group.images.length === 0 && (
                          <div className="text-gray-400 text-sm py-4 text-center w-full">
                            <svg
                              className="w-12 h-12 mx-auto mb-2 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            No hay imágenes para este color
                          </div>
                        )}
                        {/* Input para añadir nuevas imágenes */}
                        <label className="border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all w-24 h-24 group">
                          <svg
                            className="w-8 h-8 text-blue-400 group-hover:text-blue-600 mb-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span className="text-xs text-blue-600 font-medium">
                            Añadir
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              if (!e.target.files) return;
                              const filesArray = Array.from(e.target.files);
                              const uploadedImages: any[] = filesArray.map(
                                (file) => ({
                                  tempId: `temp-${Date.now()}-${Math.random()}`,
                                  url: URL.createObjectURL(file),
                                  file,
                                  is_main: false,
                                  color_id: group.colorId,
                                })
                              );

                              setLocalVariants((prev) => {
                                const hadMain = prev.some(
                                  (v) =>
                                    v.color_ID === group.colorId &&
                                    v.images &&
                                    v.images.some((im: any) => im.is_main)
                                );

                                if (!hadMain && uploadedImages.length > 0) {
                                  uploadedImages[0].is_main = true;
                                }

                                return prev.map((v) =>
                                  v.color_ID === group.colorId
                                    ? {
                                        ...v,
                                        images: [
                                          ...(v.images || []),
                                          ...uploadedImages,
                                        ],
                                      }
                                    : v
                                );
                              });

                              // reset input so same files can be selected again
                              if (e.currentTarget) e.currentTarget.value = "";
                            }}
                          />
                          <svg
                            className="w-6 h-6 text-gray-400"
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
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {localVariants.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg
                    className="w-16 h-16 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">
                    No hay variantes
                  </p>
                  <p className="text-gray-400 text-sm">
                    Añade una variante para empezar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Add-variants modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
                  <h4 className="font-bold text-white text-lg">
                    Añadir Variantes
                  </h4>
                  <p className="text-blue-100 text-sm">
                    Selecciona el color y cantidad de variantes
                  </p>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color
                    </label>
                    <select
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={addColorId}
                      onChange={(e) => {
                        const newColorId = Number(e.target.value);
                        setAddColorId(newColorId);
                        // Recalcular máximo disponible al cambiar color
                        const usedSizes = localVariants
                          .filter((v) => v.color_ID === newColorId)
                          .map((v) => v.size);
                        const available = SIZES.filter(
                          (s) => !usedSizes.includes(s)
                        ).length;
                        if (addQuantity > available) {
                          setAddQuantity(Math.max(1, available));
                        }
                      }}
                    >
                      {colors.map((c) => (
                        <option key={c.color_ID} value={c.color_ID}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={(() => {
                        const usedSizes = localVariants
                          .filter((v) => v.color_ID === Number(addColorId))
                          .map((v) => v.size);
                        return SIZES.filter((s) => !usedSizes.includes(s))
                          .length;
                      })()}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={addQuantity}
                      onChange={(e) => setAddQuantity(Number(e.target.value))}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Tallas disponibles para este color:{" "}
                      <span className="font-semibold text-blue-600">
                        {(() => {
                          const usedSizes = localVariants
                            .filter((v) => v.color_ID === Number(addColorId))
                            .map((v) => v.size);
                          return SIZES.filter((s) => !usedSizes.includes(s))
                            .length;
                        })()}
                      </span>
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="px-5 py-2.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmAddVariants}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-medium transition-all shadow-md"
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 px-6 py-5 sticky bottom-0 flex justify-between items-center gap-4">
          <button
            onClick={async () => {
              if (!selectedProduct?.product_ID) return;

              const confirmed = confirm(
                `⚠️ ¿Estás seguro de eliminar el producto "${selectedProduct.name}"?\n\n` +
                  `Esta acción eliminará:\n` +
                  `• Todas las variantes del producto\n` +
                  `• Todas las imágenes asociadas\n` +
                  `• Toda la información relacionada\n\n` +
                  `Esta acción NO se puede deshacer.`
              );

              if (!confirmed) return;

              await handleDelete();
            }}
            disabled={deleting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
          >
            {deleting ? (
              <>
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Eliminando...
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar Producto
              </>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {saving ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
