import { useEffect, useState } from "react";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../context/authcontext";
import { useCart } from "../context/CartContext";
import LogoutButton from "./Logout";

export function Nav() {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState<
    { category_ID: number; name: string }[]
  >([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backendUrl}/categories`);
        if (!res.ok) throw new Error("Error al cargar categorías");
        const data = await res.json();
        setCategories(data);
      } catch (err) {}
    };

    fetchCategories();
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      try {
        const res = await fetch(
          `${backendUrl}/search?q=${encodeURIComponent(searchTerm.trim())}`
        );
        if (!res.ok) throw new Error("Error en búsqueda");
        const data = await res.json();
        setSearchResults(data.slice(0, 5)); // Limitar a 5 resultados
        setShowResults(true);
      } catch (err) {
        setSearchResults([]);
      }
    };

    const timeoutId = setTimeout(searchProducts, 300); // Debounce de 300ms
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/producto/${productId}`);
    setSearchTerm("");
    setShowResults(false);
  };

  <div className="relative group">
    <button className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
      Categorías
    </button>
    <div className="absolute left-0 hidden group-hover:block bg-white text-black rounded shadow-lg mt-2 min-w-[180px] z-50">
      {categories.length > 0 ? (
        categories.map((cat) => (
          <Link to={`/categoria/${encodeURIComponent(cat.name)}`}>
            {cat.name}
          </Link>
        ))
      ) : (
        <p className="px-4 py-2 text-sm text-gray-500">Cargando...</p>
      )}
    </div>
  </div>;

  return (
    <>
      {/* ===== NAVBAR PRINCIPAL ===== */}
      <nav className="bg-white border-b border-gray-200 shadow-sm relative z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* ==== IZQUIERDA: Menú y Panel de control ==== */}
            <div className="flex items-center gap-4">
              {/* Botón del menú lateral */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-1 text-gray-700 hover:text-black font-medium ml-2"
              >
                <Bars3Icon className="h-6 w-6" />
                Menú
              </button>

              {/* Panel de control (solo admin) */}
              {user?.type_ID === 2 && (
                <Link
                  to="/control-panel"
                  className="text-gray-700 hover:text-black font-medium ml-10"
                >
                  Panel de Control
                </Link>
              )}
            </div>

            {/* ==== CENTRO: Barra de búsqueda ==== */}
            <div className="flex-1 max-w-2xl relative">
              <form onSubmit={handleSearch}>
                <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() =>
                      searchTerm.length >= 2 && setShowResults(true)
                    }
                    placeholder="Buscar en la tienda..."
                    className="w-full focus:outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  <button type="submit" aria-label="Buscar">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                  </button>
                </div>
              </form>

              {/* Dropdown de resultados */}
              {showResults && searchResults.length > 0 && (
                <>
                  {/* Fondo para cerrar al hacer clic fuera */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowResults(false)}
                  ></div>

                  {/* Lista de resultados */}
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.product_ID}
                        onClick={() => handleProductClick(product.product_ID)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition"
                      >
                        {/* Imagen del producto */}
                        {product.main_image ? (
                          <img
                            src={product.main_image
                              .replace("../frontend/public", "")
                              .replace(/^\.\/+/, "/")}
                            alt={product.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                            Sin img
                          </div>
                        )}

                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {product.product_name}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {product.brand_name} • {product.category_name}
                          </p>
                        </div>

                        {/* Precio */}
                        <div className="text-sm font-semibold text-gray-900">
                          {product.min_price === product.max_price
                            ? `$${Math.floor(product.min_price).toLocaleString(
                                "es-CL"
                              )}`
                            : `$${Math.floor(product.min_price).toLocaleString(
                                "es-CL"
                              )} - $${Math.floor(
                                product.max_price
                              ).toLocaleString("es-CL")}`}
                        </div>
                      </button>
                    ))}

                    {/* Botón ver todos los resultados */}
                    <button
                      onClick={() => {
                        navigate(
                          `/buscar?q=${encodeURIComponent(searchTerm.trim())}`
                        );
                        setSearchTerm("");
                        setShowResults(false);
                      }}
                      className="w-full p-3 text-sm text-blue-600 hover:bg-blue-50 font-medium text-center"
                    >
                      Ver todos los resultados ({searchResults.length}+)
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ==== DERECHA: Usuario y carrito ==== */}
            {/* ===== Menú Usuario ===== */}
            <div className="relative flex items-center gap-2">
              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1 text-gray-700 hover:text-black font-medium ml-2"
                >
                  {user
                    ? user.firstname
                      ? user.firstname.charAt(0).toUpperCase() +
                        user.firstname.slice(1).toLowerCase()
                      : "Cuenta"
                    : "Iniciar sesión"}
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {menuOpen && (
                  <>
                    {/* Fondo para cerrar al hacer clic fuera */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    ></div>

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {user ? (
                        <>
                          <Link
                            to="/perfil"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Tu perfil
                          </Link>
                          <Link
                            to="/mis-pedidos"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Mis pedidos
                          </Link>
                          <LogoutButton />
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Iniciar sesión
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Registrarse
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Carrito */}
              <Link
                to="/carrito"
                className="relative flex items-center gap-1 text-gray-700 hover:text-black font-medium ml-2"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="text-sm">{getTotalItems()}</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== PANEL LATERAL IZQUIERDO ===== */}
      {isMenuOpen && (
        <>
          {/* Fondo oscuro */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setIsMenuOpen(false)}
          ></div>

          {/* Contenedor del panel */}
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Categorías</h2>
              <button onClick={() => setIsMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <nav className="flex flex-col gap-3">
              <Link
                to="/productos"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2 font-semibold border-b border-gray-200 pb-3"
              >
                Ver todos los productos
              </Link>

              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.category_ID}
                    to={`/categoria/${encodeURIComponent(
                      cat.name.replace(/\s+/g, "-").toLowerCase()
                    )}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:bg-gray-100 rounded-md px-3 py-2"
                  >
                    {cat.name}
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm px-3">
                  Cargando categorías...
                </p>
              )}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
