import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

export function AllProductsPage() {
  const [productos, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState<{ color_ID: number; name: string }[]>(
    []
  );

  // Filtros
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterBrand, setFilterBrand] = useState<string>("");
  const [filterGender, setFilterGender] = useState<string>("");
  const [filterColor, setFilterColor] = useState<number | "">("");
  const [filterSize, setFilterSize] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("");

  // Listas únicas
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [productsRes, colorsRes] = await Promise.all([
          fetch(`${backendUrl}/all-products`),
          fetch(`${backendUrl}/colors`),
        ]);

        if (!productsRes.ok) throw new Error("Error al cargar productos");

        const data = await productsRes.json();
        const colorsData = await colorsRes.json();

        setProducts(data);
        setColors(colorsData);

        // Extraer categorías y marcas únicas
        const uniqueCategories = Array.from(
          new Set(data.map((p: Product) => p.category_name).filter(Boolean))
        ) as string[];
        const uniqueBrands = Array.from(
          new Set(data.map((p: Product) => p.brand_name).filter(Boolean))
        ) as string[];

        setCategories(uniqueCategories.sort());
        setBrands(uniqueBrands.sort());

        // Extraer tallas únicas
        const allSizes = new Set<string>();
        data.forEach((p: Product) => {
          if (p.variants) {
            p.variants.forEach((v: Variant) => {
              if (v.size) allSizes.add(v.size);
            });
          }
        });
        setSizes(Array.from(allSizes).sort());

        // Calcular rango de precios
        const prices = data
          .map((p: Product) => p.min_price)
          .filter((p: number) => p > 0);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setMinPrice(min);
        setMaxPrice(max);
        setPriceRange(max);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = productos.filter((p) => {
    const matchesCategory =
      filterCategory === "" || p.category_name === filterCategory;
    const matchesBrand = filterBrand === "" || p.brand_name === filterBrand;
    const matchesGender = filterGender === "" || p.gender === filterGender;
    const matchesPrice = p.min_price <= priceRange;

    // Filtro por color
    const matchesColor =
      filterColor === "" ||
      (p.variants &&
        p.variants.some((v: Variant) => v.color_ID === filterColor));

    // Filtro por talla
    const matchesSize =
      filterSize === "" ||
      (p.variants && p.variants.some((v: Variant) => v.size === filterSize));

    return (
      matchesCategory &&
      matchesBrand &&
      matchesGender &&
      matchesPrice &&
      matchesColor &&
      matchesSize
    );
  });

  // Ordenar productos
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.min_price - b.min_price;
    if (sortBy === "price-desc") return b.min_price - a.min_price;
    if (sortBy === "name") return a.product_name.localeCompare(b.product_name);
    return 0;
  });

  if (loading) return <p className="p-4">Cargando productos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Todos los Productos</h1>

      {/* Filtros avanzados */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="font-semibold text-lg mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca
            </label>
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas las marcas</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Género */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Género
            </label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos</option>
              <option value="M">Hombre</option>
              <option value="F">Mujer</option>
              <option value="U">Unisex</option>
            </select>
          </div>

          {/* Filtro por Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              value={filterColor}
              onChange={(e) =>
                setFilterColor(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos los colores</option>
              {colors.map((color) => (
                <option key={color.color_ID} value={color.color_ID}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Talla */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Talla
            </label>
            <select
              value={filterSize}
              onChange={(e) => setFilterSize(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas las tallas</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segunda fila: Precio, Ordenar y Limpiar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Precio máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio máximo: ${Math.floor(priceRange).toLocaleString("es-CL")}
            </label>
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>${Math.floor(minPrice).toLocaleString("es-CL")}</span>
              <span>${Math.floor(maxPrice).toLocaleString("es-CL")}</span>
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Predeterminado</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
          </div>

          {/* Limpiar filtros */}
          <div className="flex items-end">
            {(filterCategory ||
              filterBrand ||
              filterGender ||
              filterColor ||
              filterSize ||
              sortBy ||
              priceRange !== maxPrice) && (
              <button
                onClick={() => {
                  setFilterCategory("");
                  setFilterBrand("");
                  setFilterGender("");
                  setFilterColor("");
                  setFilterSize("");
                  setSortBy("");
                  setPriceRange(maxPrice);
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contador */}
      <p className="text-gray-600 mb-4">
        Mostrando {sortedProducts.length} de {productos.length} productos
      </p>

      {/* Grid de productos */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay productos que coincidan con los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setFilterCategory("");
              setFilterBrand("");
              setFilterGender("");
              setFilterColor("");
              setFilterSize("");
              setSortBy("");
              setPriceRange(maxPrice);
            }}
            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {sortedProducts.map((p) => (
            <Link
              key={`${p.product_ID}-${p.main_image}`}
              to={`/producto/${p.product_ID}`}
              className="border rounded-lg p-3 shadow hover:shadow-lg transition"
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
