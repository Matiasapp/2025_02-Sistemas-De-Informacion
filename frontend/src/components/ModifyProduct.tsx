import { useState, useEffect } from "react";

type Product = {
  product_ID: number;
  name: string;
  description: string;
  category_ID: number;
  brand_id: number;
  variants: Variant[];
};

type Variant = {
  variant_ID: number;
  color_ID: number;
  size_ID: number;
  price: number;
  stock: number;
  sku: string;
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

  // 🔹 Traer datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes, brandsRes, colorsRes] =
          await Promise.all([
            fetch("http://localhost:3000/products"),
            fetch("http://localhost:3000/categories"),
            fetch("http://localhost:3000/brands"),
            fetch("http://localhost:3000/colors"),
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

  // 🔹 Cargar producto en modal
  const loadProductDetails = async (product_ID: number) => {
    try {
      const res = await fetch(`http://localhost:3000/products/${product_ID}`);
      if (!res.ok) throw new Error("Producto no encontrado");
      const data = await res.json();
      setSelectedProduct(data);
    } catch (err) {
      console.error("Error al cargar producto:", err);
      alert("Error al cargar el producto");
    }
  };

  // 🔹 Guardar cambios (ejemplo simple)
  const handleSave = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(
        `http://localhost:3000/products/${selectedProduct.product_ID}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedProduct),
        }
      );
      if (!res.ok) throw new Error("Error al actualizar producto");
      alert("Producto actualizado");
      setSelectedProduct(null);
      // 🔹 Refrescar lista
      const refreshed = await fetch("http://localhost:3000/products");
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
                {categories.find((c) => c.category_ID === Number(p.category_ID))
                  ?.name || "Sin categoría"}
              </td>
              <td className="px-4 py-2">
                {brands.find((b) => b.brand_id === Number(p.brand_id))?.name ||
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
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Editar: {selectedProduct.name}
            </h2>

            {/* 🔹 Formulario básico de producto */}
            <div className="mb-4">
              <label className="block font-semibold">Nombre</label>
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

            <div className="mb-4">
              <label className="block font-semibold">Descripción</label>
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

            <div className="mb-4">
              <label className="block font-semibold">Categoría</label>
              <select
                className="border p-2 w-full"
                value={selectedProduct.category_ID}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    category_ID: Number(e.target.value),
                  })
                }
              >
                {categories.map((c) => (
                  <option key={c.category_ID} value={c.category_ID}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-semibold">Marca</label>
              <select
                className="border p-2 w-full"
                value={selectedProduct.brand_id}
                onChange={(e) =>
                  setSelectedProduct({
                    ...selectedProduct,
                    brand_id: Number(e.target.value),
                  })
                }
              >
                {brands.map((b) => (
                  <option key={b.brand_id} value={b.brand_id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 🔹 Variantes */}
            <h3 className="text-lg font-bold mt-6 mb-2">Variantes</h3>
            <table className="min-w-full border mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1">Color</th>
                  <th className="px-2 py-1">Talla</th>
                  <th className="px-2 py-1">Precio</th>
                  <th className="px-2 py-1">Stock</th>
                  <th className="px-2 py-1">SKU</th>
                </tr>
              </thead>
              <tbody>
                {selectedProduct.variants.map((v, i) => (
                  <tr key={v.variant_ID} className="border-b">
                    <td className="px-2 py-1">
                      <select
                        value={v.color_ID}
                        onChange={(e) => {
                          const updatedVariants = [...selectedProduct.variants];
                          updatedVariants[i].color_ID = Number(e.target.value);
                          setSelectedProduct({
                            ...selectedProduct,
                            variants: updatedVariants,
                          });
                        }}
                      >
                        {colors.map((c) => (
                          <option key={c.color_ID} value={c.color_ID}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1">{v.size_ID}</td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => {
                          const updatedVariants = [...selectedProduct.variants];
                          updatedVariants[i].price = Number(e.target.value);
                          setSelectedProduct({
                            ...selectedProduct,
                            variants: updatedVariants,
                          });
                        }}
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => {
                          const updatedVariants = [...selectedProduct.variants];
                          updatedVariants[i].stock = Number(e.target.value);
                          setSelectedProduct({
                            ...selectedProduct,
                            variants: updatedVariants,
                          });
                        }}
                      />
                    </td>
                    <td className="px-2 py-1">{v.sku}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🔹 Botones */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
              >
                Cerrar
              </button>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
