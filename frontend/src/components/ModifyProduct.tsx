import { useState, useEffect } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// 🔹 Tipos principales
type Image = {
  url: string;
};

type Variant = {
  variant_id: number;
  color_ID: number;
  size: string;
  price: number;
  stock: number;
  sku: string;
  images: Image[]; // 🔹 Agregado
};

type Product = {
  product_ID: number;
  name: string;
  description: string;
  category_ID: number;
  brand_id: number;
  variants: Variant[];
};

type Category = { category_ID: number; name: string };
type Brand = { brand_id: number; name: string };
type Color = { color_ID: number; name: string };

export default function AdminProductPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes, colorsRes] =
          await Promise.all([
            fetch(`${backendUrl}/products`),
            fetch(`${backendUrl}/categories`),
            fetch(`${backendUrl}/brands`),
            fetch(`${backendUrl}/colors`),
          ]);

        setProducts(await productsRes.json());
        setCategories(await categoriesRes.json());
        setBrands(await brandsRes.json());
        setColors(await colorsRes.json());
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Cargar detalles del producto (incluye variantes e imágenes)
  const loadProductDetails = async (product_ID: number) => {
    try {
      const res = await fetch(`${backendUrl}/products/${product_ID}`);
      if (!res.ok) throw new Error("Producto no encontrado");
      const data = await res.json();

      // Asegurar que cada variante tenga array de imágenes
      const formatted = {
        ...data,
        variants: data.variants.map((v: any) => ({
          ...v,
          images: v.images || [],
        })),
      };

      setSelectedProduct(formatted);
    } catch (err) {
      console.error("Error al cargar producto:", err);
      alert("Error al cargar el producto");
    }
  };

  // 🔹 Guardar cambios en producto y variantes
  const handleSave = async () => {
    if (!selectedProduct) return;

    try {
      // 1️⃣ Actualizar datos del producto
      await fetch(`${backendUrl}/products/${selectedProduct.product_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedProduct.name,
          description: selectedProduct.description,
          category_ID: Number(selectedProduct.category_ID),
          brand_id: Number(selectedProduct.brand_id),
        }),
      });

      // 2️⃣ Actualizar cada variante
      for (const v of selectedProduct.variants) {
        await fetch(`${backendUrl}/variants/${v.variant_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            color_ID: Number(v.color_ID),
            size: v.size,
            price: Number(v.price),
            stock: Number(v.stock),
            sku: v.sku,
          }),
        });

        // 3️⃣ Subir imágenes (solo si las agregaste)
        for (const img of v.images) {
          if (img.url.startsWith("blob:")) {
            const formData = new FormData();
            const file = await fetch(img.url).then((r) => r.blob());
            formData.append("image", file);
            formData.append("variant_id", String(v.variant_id));

            await fetch(`${backendUrl}/variant-images`, {
              method: "POST",
              body: formData,
            });
          }
        }
      }

      alert("Producto y variantes actualizados correctamente ");
      setSelectedProduct(null);

      // 🔄 Refrescar lista
      const refreshed = await fetch(`${backendUrl}/products`);
      setProducts(await refreshed.json());
    } catch (err) {
      console.error(err);
      alert("Error al guardar cambios");
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Panel Admin de Productos</h1>

      {/* 🔹 Tabla de productos */}
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Nombre</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Categoría</th>
            <th className="px-4 py-2">Marca</th>
            <th className="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.product_ID} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">{p.description}</td>
              <td className="px-4 py-2">
                {categories.find((c) => c.category_ID === p.category_ID)
                  ?.name || "Sin categoría"}
              </td>
              <td className="px-4 py-2">
                {brands.find((b) => b.brand_id === p.brand_id)?.name ||
                  "Sin marca"}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => loadProductDetails(p.product_ID)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔹 Modal de edición */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-4/5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Editar: {selectedProduct.name}
            </h2>

            {/* Producto */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  className="border p-2 w-full"
                  value={selectedProduct.name}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Descripción</label>
                <textarea
                  className="border p-2 w-full"
                  value={selectedProduct.description}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label>Categoría</label>
                <select
                  value={selectedProduct.category_ID}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      category_ID: Number(e.target.value),
                    })
                  }
                  className="border p-2 w-full"
                >
                  {categories.map((c) => (
                    <option key={c.category_ID} value={c.category_ID}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Marca</label>
                <select
                  value={selectedProduct.brand_id}
                  onChange={(e) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      brand_id: Number(e.target.value),
                    })
                  }
                  className="border p-2 w-full"
                >
                  {brands.map((b) => (
                    <option key={b.brand_id} value={b.brand_id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Variantes */}
            <h3 className="text-lg font-bold mb-2">Variantes</h3>

            <div className="grid grid-cols-6 gap-3 items-center font-semibold text-sm mb-2">
              <div className="px-1 text-center">Color</div>
              <div className="px-1 text-center">Talla</div>
              <div className="px-1 text-center">Precio</div>
              <div className="px-1 text-center">Stock</div>
              <div className="px-1 text-center">SKU</div>
              <div className="px-1 text-center">Acción</div>
            </div>
            {selectedProduct.variants.map((v, i) => (
              <div key={v.variant_id} className="mb-4 border p-2 rounded">
                <div className="grid grid-cols-6 gap-2 items-center">
                  {/* Color */}
                  <select
                    value={v.color_ID}
                    className="p-1 border text-center"
                    onChange={(e) => {
                      const updated = [...selectedProduct.variants];
                      updated[i].color_ID = Number(e.target.value);
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  >
                    {colors.map((c) => (
                      <option key={c.color_ID} value={c.color_ID}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Talla */}
                  <input
                    type="text"
                    value={v.size}
                    className="border p-1 text-center"
                    onChange={(e) => {
                      const updated = [...selectedProduct.variants];
                      updated[i].size = e.target.value;
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  />

                  {/* Precio */}
                  <input
                    type="number"
                    value={v.price}
                    className="border p-1 text-center"
                    onChange={(e) => {
                      const updated = [...selectedProduct.variants];
                      updated[i].price = Number(e.target.value);
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  />

                  {/* Stock */}
                  <input
                    type="number"
                    value={v.stock}
                    className="border p-1 text-center"
                    onChange={(e) => {
                      const updated = [...selectedProduct.variants];
                      updated[i].stock = Number(e.target.value);
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  />

                  {/* SKU */}
                  <input
                    type="text"
                    value={v.sku}
                    className="border p-1 text-center"
                    onChange={(e) => {
                      const updated = [...selectedProduct.variants];
                      updated[i].sku = e.target.value;
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  />

                  {/* Eliminar variante */}
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                      const updated = selectedProduct.variants.filter(
                        (_, idx) => idx !== i
                      );
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updated,
                      });
                    }}
                  >
                    Eliminar
                  </button>
                </div>

                {/* Imágenes */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {v.images?.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.url}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <button
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        onClick={() => {
                          const updatedImages = v.images.filter(
                            (_, j) => j !== idx
                          );
                          const updatedVariants = [...selectedProduct.variants];
                          updatedVariants[i].images = updatedImages;
                          setSelectedProduct({
                            ...selectedProduct,
                            variants: updatedVariants,
                          });
                        }}
                      >
                        x
                      </button>
                    </div>
                  ))}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      const filesArray = Array.from(e.target.files);
                      const uploadedImages = filesArray.map((file) => ({
                        url: URL.createObjectURL(file),
                      }));
                      const updatedVariants = [...selectedProduct.variants];
                      updatedVariants[i].images = [
                        ...(updatedVariants[i].images || []),
                        ...uploadedImages,
                      ];
                      setSelectedProduct({
                        ...selectedProduct,
                        variants: updatedVariants,
                      });
                    }}
                  />
                </div>
              </div>
            ))}

            {/* Botones */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  const newVariant: Variant = {
                    variant_id: Date.now(),
                    color_ID: colors[0]?.color_ID || 1,
                    size: "",
                    price: 0,
                    stock: 0,
                    sku: "",
                    images: [],
                  };
                  setSelectedProduct({
                    ...selectedProduct,
                    variants: [...selectedProduct.variants, newVariant],
                  });
                }}
              >
                + Agregar Variante
              </button>

              <div className="flex gap-2">
                <button
                  className="bg-gray-300 px-4 py-2 rounded"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cerrar
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={async () => await handleSave()}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
