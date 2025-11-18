import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Variant = {
  variant_ID: number;
  color_ID: number;
  size: string;
  price: number;
  stock: number;
};

type Product = {
  product_ID: number;
  product_name: string;
  description: string;
  category_name: string;
  brand_name: string;
  gender: string;
  min_price: number;
  max_price: number;
  main_image: string | null;
  variants: Variant[];
};

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || "";
  const [productos, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(
          `${backendUrl}/search?q=${encodeURIComponent(searchTerm)}`
        );

        if (!res.ok) throw new Error("Error en la búsqueda");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchTerm]);

  // Ordenar productos
  const sortedProducts = [...productos].sort((a, b) => {
    if (sortBy === "price-asc") return a.min_price - b.min_price;
    if (sortBy === "price-desc") return b.min_price - a.min_price;
    if (sortBy === "name") return a.product_name.localeCompare(b.product_name);
    return 0;
  });

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <p className="text-gray-600">Buscando...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Resultados de búsqueda</h1>
        <p className="text-gray-600">
          {searchTerm && (
            <>
              Búsqueda: <span className="font-semibold">"{searchTerm}"</span>
            </>
          )}
        </p>
      </div>

      {/* Controles */}
      {productos.length > 0 && (
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            {sortedProducts.length}{" "}
            {sortedProducts.length === 1
              ? "producto encontrado"
              : "productos encontrados"}
          </p>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Ordenar por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
            >
              <option value="">Predeterminado</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
          </div>
        </div>
      )}

      {/* Resultados */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No se encontraron productos para "{searchTerm}"
          </p>
          <Link
            to="/productos"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todos los productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {sortedProducts.map((p) => (
            <Link
              key={`${p.product_ID}-${p.main_image}`}
              to={`/producto/${p.product_ID}`}
              className="border rounded-lg p-3 shadow hover:shadow-lg transition cursor-pointer"
            >
              {/* Imagen del producto */}
              {p.main_image ? (
                (() => {
                  const src = `${p.main_image}`
                    .replace("../frontend/public", "")
                    .replace(/^\.\/+/, "/");
                  return (
                    <img
                      src={src}
                      alt={p.product_name}
                      className="w-full h-48 object-cover rounded"
                    />
                  );
                })()
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                  Sin imagen
                </div>
              )}

              {/* Información del producto */}
              <p className="text-sm text-gray-500 mt-2">{p.brand_name}</p>
              <h2 className="text-base font-medium mt-1 line-clamp-2">
                {p.product_name}
              </h2>
              <p className="text-sm text-gray-400">{p.category_name}</p>

              <p className="text-gray-900 font-semibold mt-2">
                {p.min_price === p.max_price
                  ? `$${Math.floor(p.min_price).toLocaleString("es-CL")}`
                  : `$${Math.floor(p.min_price).toLocaleString(
                      "es-CL"
                    )} - $${Math.floor(p.max_price).toLocaleString("es-CL")}`}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
