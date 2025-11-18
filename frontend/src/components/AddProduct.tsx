import React, { useEffect, useState } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Variant = {
  color_ID: number;
  size: string;
  price: string;
  stock: string;
  sku: string;
  images: File[]; // archivos nuevos subidos
  mainImageIndex?: number;
};
type Category = { category_ID: number; name: string; size_type?: string };
type Supplier = { supplier_ID: number; name: string };
type Color = { color_ID: number; name: string };
type Brand = { brand_id: number; name: string };

type ExistingImages = { color_ID: number; urls: string[] };

function AddProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category_ID, setCategoryID] = useState<number | "">("");
  const [supplier_ID, setSupplierID] = useState<number | "">("");
  const [brand_ID, setBrandID] = useState<number | "">("");
  const [main_color_ID, setMainColorID] = useState<number | "">("");
  const [gender, setGender] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);

  const [variants, setVariants] = useState<Variant[]>([
    {
      color_ID: 0,
      size: "",
      price: "",
      stock: "",
      sku: "",
      images: [],
    },
  ]);

  const [existingImages, setExistingImages] = useState<ExistingImages[]>([]);

  const SIZES_TOP = ["XS", "S", "M", "L", "XL", "2XL"]; // Poleras, Polerones, Camisas
  const SIZES_BOTTOM = ["28", "30", "32", "34", "36", "38", "40"]; // Pantalones, Jeans, Shorts

  const selectedCategory = categories.find(
    (c) => c.category_ID === category_ID
  );
  const usedColors = Array.from(new Set(variants.map((v) => v.color_ID)));
  const selectableColors = colors.filter((c) =>
    usedColors.includes(c.color_ID)
  );
  const SIZES =
    selectedCategory?.size_type === "numeric" ? SIZES_BOTTOM : SIZES_TOP;

  useEffect(() => {
    fetch(`${backendUrl}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => {});

    fetch(`${backendUrl}/colors`)
      .then((res) => res.json())
      .then(setColors)
      .catch(() => {});

    fetch(`${backendUrl}/brands`)
      .then((res) => res.json())
      .then(setBrands)
      .catch(() => {});

    fetch(`${backendUrl}/suppliers`)
      .then((res) => res.json())
      .then(setSuppliers)
      .catch(() => {});
  }, []);

  const generateSKU = (brandId: number | "", colorId: number, size: string) => {
    if (!brandId || !colorId || !size) return "";

    const brandName = brands.find((b) => b.brand_id === brandId)?.name || "";
    const colorName = colors.find((c) => c.color_ID === colorId)?.name || "";

    // Prefijos limpiados
    const b = brandName.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "BRD";
    const c = colorName.replace(/\s+/g, "").slice(0, 3).toUpperCase() || "CLR";
    const s = size.replace(/\s+/g, "").toUpperCase();

    return `${b}-${c}-${s}`;
  };

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number | File[] | undefined
  ) => {
    setVariants((prev) => {
      const updated = [...prev];

      // 🔹 Si el cambio es marcar una imagen principal
      if (field === "mainImageIndex") {
        const colorID = updated[index].color_ID;

        // Marcar la misma imagen como principal en todas las variantes del mismo color
        updated.forEach((variant) => {
          if (variant.color_ID === colorID) {
            variant.mainImageIndex = value as number | undefined;
          }
        });

        return updated;
      }

      // 🔹 Cualquier otro cambio normal
      // @ts-ignore asignamos de forma genérica
      updated[index][field] = value as never;

      // Si cambian color o talla → regenerar SKU
      if (field === "color_ID" || field === "size") {
        const sku = generateSKU(
          brand_ID,
          updated[index].color_ID,
          updated[index].size
        );
        updated[index].sku = sku;
      }

      // Si cambian las imágenes → actualizar previews
      if (field === "images" && Array.isArray(value) && value.length > 0) {
        const colorID = updated[index].color_ID;
        setExistingImages((prevImgs) => [
          ...prevImgs.filter((img) => img.color_ID !== colorID),
          {
            color_ID: colorID,
            urls: value.map((file) => URL.createObjectURL(file)),
          },
        ]);
      }

      return updated;
    });
  };

  // Si cambia la marca principal: actualizar todas las SKUs (porque el prefijo depende de la marca)
  useEffect(() => {
    if (!brand_ID) return;
    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        sku: generateSKU(brand_ID, v.color_ID, v.size),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand_ID]);

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        color_ID: 0,
        size: "",
        price: "",
        stock: "",
        sku: "",
        images: [],
      },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !name.trim() ||
      category_ID === "" ||
      brand_ID === "" ||
      supplier_ID === ""
    ) {
      alert("Completa todos los campos obligatorios");
      return;
    }

    // Verificar que cada variante tenga color, talla y precio válidos
    if (variants.some((v) => v.color_ID === 0 || v.size === "")) {
      alert("Cada variante debe tener un color y una talla seleccionados");
      return;
    }

    if (variants.some((v) => v.price === "" || Number(v.price) < 0)) {
      alert("Todas las variantes deben tener un precio válido");
      return;
    }

    // Validar que al menos una variante tenga una imagen principal seleccionada
    const hasMainImage = variants.some((v) => v.mainImageIndex !== undefined);

    if (!hasMainImage) {
      alert(
        "Debes seleccionar una imagen principal para al menos una variante."
      );
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category_ID", String(category_ID));
    formData.append("supplier_ID", String(supplier_ID));
    formData.append("brand_id", String(brand_ID));
    formData.append("main_color_ID", String(main_color_ID));
    formData.append("gender", gender);

    variants.forEach((v, i) => {
      formData.append(
        `variants[${i}]`,
        JSON.stringify({
          color_ID: v.color_ID,
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
          mainImageIndex: v.mainImageIndex,
        })
      );
      if (v.images && v.images.length > 0) {
        v.images.forEach((file) =>
          formData.append(`variantImages[${i}]`, file)
        );
      }
    });

    try {
      const res = await fetch(`${backendUrl}/add-product`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        // limpiar formulario
        setName("");
        setDescription("");
        setCategoryID("");
        setSupplierID("");
        setBrandID("");
        setGender("");
        setVariants([
          {
            color_ID: 0,
            size: "",
            price: "",
            stock: "",
            sku: "",
            images: [],
          },
        ]);
        setExistingImages([]);
      }
    } catch (err) {
      alert("Error al crear producto");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Añadir Nuevo Producto
                </h2>
                <p className="text-blue-100 text-sm">
                  Completa la información del producto y sus variantes
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-xl p-6">
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

              {/* Marca y Nombre */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marca *
                  </label>
                  <select
                    value={brand_ID}
                    onChange={(e) => setBrandID(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                  >
                    <option value="">Selecciona una marca</option>
                    {brands.map((b) => (
                      <option key={b.brand_id} value={b.brand_id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Zapatillas deportivas"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe las características del producto..."
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Categoría */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    value={category_ID}
                    onChange={(e) => setCategoryID(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((c) => (
                      <option key={c.category_ID} value={c.category_ID}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Proveedor *
                  </label>
                  <select
                    value={supplier_ID}
                    onChange={(e) => setSupplierID(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                  >
                    <option value="">Selecciona un proveedor</option>
                    {suppliers.map((c) => (
                      <option key={c.supplier_ID} value={c.supplier_ID}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color principal */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color a mostrar en la tienda *
                  </label>
                  <select
                    value={main_color_ID}
                    onChange={(e) => setMainColorID(Number(e.target.value))}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={selectableColors.length === 0}
                    required
                  >
                    <option value="">
                      {selectableColors.length === 0
                        ? "Agrega variantes primero"
                        : "Selecciona un color"}
                    </option>
                    {selectableColors.map((c) => (
                      <option key={c.color_ID} value={c.color_ID}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {selectableColors.length === 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
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
                      Agrega al menos una variante con color
                    </p>
                  )}
                </div>

                {/* Género */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Género *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white"
                    required
                  >
                    <option value="select">Selecciona un género</option>
                    <option value="Hombre">Hombre</option>
                    <option value="Mujer">Mujer</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección de Variantes */}
            <div className="bg-white rounded-xl shadow-md p-6">
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
                  <span className="text-sm text-gray-500 ml-2 font-normal">
                    (SKU se genera automáticamente)
                  </span>
                </h3>
              </div>

              <div className="space-y-4">
                {(() => {
                  // Agrupar variantes por color
                  const groupsByColor: {
                    colorId: number;
                    variants: Variant[];
                  }[] = [];

                  variants.forEach((v) => {
                    if (v.color_ID === 0) return; // Ignorar variantes sin color

                    const existing = groupsByColor.find(
                      (g) => g.colorId === v.color_ID
                    );
                    if (existing) {
                      existing.variants.push(v);
                    } else {
                      groupsByColor.push({
                        colorId: v.color_ID,
                        variants: [v],
                      });
                    }
                  });

                  // Obtener imágenes por color
                  const getImagesForColor = (colorId: number) => {
                    return (
                      existingImages.find((img) => img.color_ID === colorId)
                        ?.urls || []
                    );
                  };

                  return groupsByColor.map((group) => (
                    <div
                      key={group.colorId}
                      className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 flex items-center">
                          <span className="text-blue-600 mr-2">●</span>
                          {colors.find((c) => c.color_ID === group.colorId)
                            ?.name || `Color ${group.colorId}`}
                        </h4>
                      </div>

                      {/* Variantes del mismo color */}
                      <div className="space-y-3">
                        {group.variants.map((v) => {
                          const variantIndex = variants.findIndex(
                            (variant) =>
                              variant.color_ID === v.color_ID &&
                              variant.size === v.size &&
                              variant.sku === v.sku
                          );

                          return (
                            <div
                              key={variantIndex}
                              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-blue-300 transition-all"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {/* Talla */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Talla
                                  </label>
                                  <select
                                    value={v.size}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variantIndex,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                  >
                                    <option value="">Seleccionar...</option>
                                    {SIZES.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Precio */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Precio ($)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={v.price}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(
                                        /[.,]/g,
                                        ""
                                      );
                                      handleVariantChange(
                                        variantIndex,
                                        "price",
                                        value
                                      );
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "." || e.key === ",") {
                                        e.preventDefault();
                                      }
                                    }}
                                    step="1"
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* Stock */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={v.stock}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variantIndex,
                                        "stock",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* SKU */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    SKU
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Auto-generado"
                                    value={v.sku}
                                    readOnly
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                  />
                                </div>

                                {/* Eliminar variante */}
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(variantIndex)}
                                    className="w-full px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-all flex items-center justify-center gap-2"
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
                            </div>
                          );
                        })}
                      </div>

                      {/* Sección de Imágenes - Una sola vez por color */}
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
                          {/* Vista previa de imágenes */}
                          {getImagesForColor(group.colorId).length > 0 && (
                            <>
                              {getImagesForColor(group.colorId).map(
                                (url, idx) => {
                                  // Obtener el índice de mainImageIndex de cualquier variante de este color
                                  const representativeVariant =
                                    group.variants[0];
                                  const isMain =
                                    representativeVariant.mainImageIndex ===
                                    idx;

                                  return (
                                    <div key={idx} className="relative group">
                                      <img
                                        src={url}
                                        alt={`imagen ${idx}`}
                                        className={`w-24 h-24 object-cover rounded-lg cursor-pointer transition-all ${
                                          isMain
                                            ? "ring-4 ring-blue-500 scale-105 shadow-lg"
                                            : "ring-2 ring-gray-200 hover:ring-blue-300"
                                        }`}
                                        onClick={() => {
                                          // Marcar como principal en todas las variantes del mismo color
                                          group.variants.forEach((variant) => {
                                            const vIndex = variants.findIndex(
                                              (v) =>
                                                v.color_ID ===
                                                  variant.color_ID &&
                                                v.size === variant.size &&
                                                v.sku === variant.sku
                                            );
                                            if (vIndex !== -1) {
                                              handleVariantChange(
                                                vIndex,
                                                "mainImageIndex",
                                                idx
                                              );
                                            }
                                          });
                                        }}
                                      />

                                      {/* Badge de principal */}
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

                                      {/* Botón eliminar */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          // Eliminar imagen de todas las variantes del mismo color
                                          group.variants.forEach((variant) => {
                                            const vIndex = variants.findIndex(
                                              (v) =>
                                                v.color_ID ===
                                                  variant.color_ID &&
                                                v.size === variant.size &&
                                                v.sku === variant.sku
                                            );
                                            if (vIndex !== -1) {
                                              const newImageFiles =
                                                variant.images.filter(
                                                  (_, fileIdx) =>
                                                    fileIdx !== idx
                                                );
                                              handleVariantChange(
                                                vIndex,
                                                "images",
                                                newImageFiles
                                              );

                                              if (
                                                variant.mainImageIndex === idx
                                              ) {
                                                handleVariantChange(
                                                  vIndex,
                                                  "mainImageIndex",
                                                  undefined
                                                );
                                              }
                                            }
                                          });

                                          // Actualizar existingImages
                                          setExistingImages((prev) =>
                                            prev.map((img) =>
                                              img.color_ID === group.colorId
                                                ? {
                                                    ...img,
                                                    urls: img.urls.filter(
                                                      (_, imgIdx) =>
                                                        imgIdx !== idx
                                                    ),
                                                  }
                                                : img
                                            )
                                          );
                                        }}
                                        className="absolute right-2 bottom-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition-all"
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
                                }
                              )}
                            </>
                          )}

                          {/* Input de imágenes */}
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
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files) {
                                  const newFiles = Array.from(e.target.files);

                                  // Añadir imágenes a todas las variantes del mismo color
                                  group.variants.forEach((variant) => {
                                    const vIndex = variants.findIndex(
                                      (v) =>
                                        v.color_ID === variant.color_ID &&
                                        v.size === variant.size &&
                                        v.sku === variant.sku
                                    );
                                    if (vIndex !== -1) {
                                      const existing = variant.images || [];
                                      const updatedImages = [
                                        ...existing,
                                        ...newFiles,
                                      ];
                                      handleVariantChange(
                                        vIndex,
                                        "images",
                                        updatedImages
                                      );
                                    }
                                  });
                                }
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ));
                })()}

                {/* Variantes sin color asignado */}
                {variants.filter((v) => v.color_ID === 0).length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2"
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
                      Variantes sin color
                    </h4>
                    <div className="space-y-3">
                      {variants
                        .map((v, i) =>
                          v.color_ID === 0 ? { variant: v, index: i } : null
                        )
                        .filter(Boolean)
                        .map((item) => {
                          const v = item!.variant;
                          const i = item!.index;

                          return (
                            <div
                              key={i}
                              className="bg-white rounded-lg p-4 border-2 border-gray-200"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                                {/* Color */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Color *
                                  </label>
                                  <select
                                    value={v.color_ID}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        i,
                                        "color_ID",
                                        Number(e.target.value)
                                      )
                                    }
                                    className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  >
                                    <option value={0}>Seleccionar...</option>
                                    {colors.map((c) => (
                                      <option
                                        key={c.color_ID}
                                        value={c.color_ID}
                                      >
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Talla */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Talla
                                  </label>
                                  <select
                                    value={v.size}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        i,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    required
                                  >
                                    <option value="">Seleccionar...</option>
                                    {SIZES.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Precio */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Precio ($)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={v.price}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        i,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* Stock */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Stock
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    value={v.stock}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        i,
                                        "stock",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>

                                {/* SKU */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    SKU
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Auto-generado"
                                    value={v.sku}
                                    readOnly
                                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                                  />
                                </div>

                                {/* Eliminar variante */}
                                <div className="flex items-end">
                                  <button
                                    type="button"
                                    onClick={() => removeVariant(i)}
                                    className="w-full px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition-all flex items-center justify-center gap-2"
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
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {variants.length === 0 && (
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

              <div className="mt-6">
                <button
                  type="button"
                  onClick={addVariant}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center gap-2 font-medium"
                >
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Añadir Variante
                </button>
              </div>
            </div>

            {/* Botón Submit */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl flex justify-end">
              <button
                type="submit"
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-semibold transition-all shadow-lg flex items-center gap-2"
              >
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
                Guardar Producto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddProductForm;
