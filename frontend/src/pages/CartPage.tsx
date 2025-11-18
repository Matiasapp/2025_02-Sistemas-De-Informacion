import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import { TrashIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import PayPalButton from "../components/PayPalButton";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/authcontext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Comunas por región
const comunasPorRegion: Record<string, string[]> = {
  "Región de Arica y Parinacota": [
    "Arica",
    "Camarones",
    "Putre",
    "General Lagos",
  ],
  "Región de Tarapacá": [
    "Iquique",
    "Alto Hospicio",
    "Pozo Almonte",
    "Camiña",
    "Colchane",
    "Huara",
    "Pica",
  ],
  "Región de Antofagasta": [
    "Antofagasta",
    "Mejillones",
    "Sierra Gorda",
    "Taltal",
    "Calama",
    "Ollagüe",
    "San Pedro de Atacama",
    "Tocopilla",
    "María Elena",
  ],
  "Región de Atacama": [
    "Copiapó",
    "Caldera",
    "Tierra Amarilla",
    "Chañaral",
    "Diego de Almagro",
    "Vallenar",
    "Alto del Carmen",
    "Freirina",
    "Huasco",
  ],
  "Región de Coquimbo": [
    "La Serena",
    "Coquimbo",
    "Andacollo",
    "La Higuera",
    "Paiguano",
    "Vicuña",
    "Illapel",
    "Canela",
    "Los Vilos",
    "Salamanca",
    "Ovalle",
    "Combarbalá",
    "Monte Patria",
    "Punitaqui",
    "Río Hurtado",
  ],
  "Región de Valparaíso": [
    "Valparaíso",
    "Casablanca",
    "Concón",
    "Juan Fernández",
    "Puchuncaví",
    "Quintero",
    "Viña del Mar",
    "Isla de Pascua",
    "Los Andes",
    "Calle Larga",
    "Rinconada",
    "San Esteban",
    "La Ligua",
    "Cabildo",
    "Papudo",
    "Petorca",
    "Zapallar",
    "Quillota",
    "Calera",
    "Hijuelas",
    "La Cruz",
    "Nogales",
    "San Antonio",
    "Algarrobo",
    "Cartagena",
    "El Quisco",
    "El Tabo",
    "Santo Domingo",
    "San Felipe",
    "Catemu",
    "Llaillay",
    "Panquehue",
    "Putaendo",
    "Santa María",
    "Quilpué",
    "Limache",
    "Olmué",
    "Villa Alemana",
  ],
  "Región Metropolitana": [
    "Santiago",
    "Cerrillos",
    "Cerro Navia",
    "Conchalí",
    "El Bosque",
    "Estación Central",
    "Huechuraba",
    "Independencia",
    "La Cisterna",
    "La Florida",
    "La Granja",
    "La Pintana",
    "La Reina",
    "Las Condes",
    "Lo Barnechea",
    "Lo Espejo",
    "Lo Prado",
    "Macul",
    "Maipú",
    "Ñuñoa",
    "Pedro Aguirre Cerda",
    "Peñalolén",
    "Providencia",
    "Pudahuel",
    "Quilicura",
    "Quinta Normal",
    "Recoleta",
    "Renca",
    "San Joaquín",
    "San Miguel",
    "San Ramón",
    "Vitacura",
    "Puente Alto",
    "Pirque",
    "San José de Maipo",
    "Colina",
    "Lampa",
    "Tiltil",
    "San Bernardo",
    "Buin",
    "Calera de Tango",
    "Paine",
    "Melipilla",
    "Alhué",
    "Curacaví",
    "María Pinto",
    "San Pedro",
    "Talagante",
    "El Monte",
    "Isla de Maipo",
    "Padre Hurtado",
    "Peñaflor",
  ],
  "Región del Libertador General Bernardo O'Higgins": [
    "Rancagua",
    "Codegua",
    "Coinco",
    "Coltauco",
    "Doñihue",
    "Graneros",
    "Las Cabras",
    "Machalí",
    "Malloa",
    "Mostazal",
    "Olivar",
    "Peumo",
    "Pichidegua",
    "Quinta de Tilcoco",
    "Rengo",
    "Requínoa",
    "San Vicente",
    "Pichilemu",
    "La Estrella",
    "Litueche",
    "Marchihue",
    "Navidad",
    "Paredones",
    "San Fernando",
    "Chépica",
    "Chimbarongo",
    "Lolol",
    "Nancagua",
    "Palmilla",
    "Peralillo",
    "Placilla",
    "Pumanque",
    "Santa Cruz",
  ],
  "Región del Maule": [
    "Talca",
    "Constitución",
    "Curepto",
    "Empedrado",
    "Maule",
    "Pelarco",
    "Pencahue",
    "Río Claro",
    "San Clemente",
    "San Rafael",
    "Cauquenes",
    "Chanco",
    "Pelluhue",
    "Curicó",
    "Hualañé",
    "Licantén",
    "Molina",
    "Rauco",
    "Romeral",
    "Sagrada Familia",
    "Teno",
    "Vichuquén",
    "Linares",
    "Colbún",
    "Longaví",
    "Parral",
    "Retiro",
    "San Javier",
    "Villa Alegre",
    "Yerbas Buenas",
  ],
  "Región de Ñuble": [
    "Chillán",
    "Bulnes",
    "Cobquecura",
    "Coelemu",
    "Coihueco",
    "Chillán Viejo",
    "El Carmen",
    "Ninhue",
    "Ñiquén",
    "Pemuco",
    "Pinto",
    "Portezuelo",
    "Quillón",
    "Quirihue",
    "Ránquil",
    "San Carlos",
    "San Fabián",
    "San Ignacio",
    "San Nicolás",
    "Treguaco",
    "Yungay",
  ],
  "Región del Biobío": [
    "Concepción",
    "Coronel",
    "Chiguayante",
    "Florida",
    "Hualqui",
    "Lota",
    "Penco",
    "San Pedro de la Paz",
    "Santa Juana",
    "Talcahuano",
    "Tomé",
    "Hualpén",
    "Lebu",
    "Arauco",
    "Cañete",
    "Contulmo",
    "Curanilahue",
    "Los Álamos",
    "Tirúa",
    "Los Ángeles",
    "Antuco",
    "Cabrero",
    "Laja",
    "Mulchén",
    "Nacimiento",
    "Negrete",
    "Quilaco",
    "Quilleco",
    "San Rosendo",
    "Santa Bárbara",
    "Tucapel",
    "Yumbel",
    "Alto Biobío",
  ],
  "Región de La Araucanía": [
    "Temuco",
    "Carahue",
    "Cunco",
    "Curarrehue",
    "Freire",
    "Galvarino",
    "Gorbea",
    "Lautaro",
    "Loncoche",
    "Melipeuco",
    "Nueva Imperial",
    "Padre Las Casas",
    "Perquenco",
    "Pitrufquén",
    "Pucón",
    "Saavedra",
    "Teodoro Schmidt",
    "Toltén",
    "Vilcún",
    "Villarrica",
    "Cholchol",
    "Angol",
    "Collipulli",
    "Curacautín",
    "Ercilla",
    "Lonquimay",
    "Los Sauces",
    "Lumaco",
    "Purén",
    "Renaico",
    "Traiguén",
    "Victoria",
  ],
  "Región de Los Ríos": [
    "Valdivia",
    "Corral",
    "Lanco",
    "Los Lagos",
    "Máfil",
    "Mariquina",
    "Paillaco",
    "Panguipulli",
    "La Unión",
    "Futrono",
    "Lago Ranco",
    "Río Bueno",
  ],
  "Región de Los Lagos": [
    "Puerto Montt",
    "Calbuco",
    "Cochamó",
    "Fresia",
    "Frutillar",
    "Los Muermos",
    "Llanquihue",
    "Maullín",
    "Puerto Varas",
    "Castro",
    "Ancud",
    "Chonchi",
    "Curaco de Vélez",
    "Dalcahue",
    "Puqueldón",
    "Queilén",
    "Quellón",
    "Quemchi",
    "Quinchao",
    "Osorno",
    "Puerto Octay",
    "Purranque",
    "Puyehue",
    "Río Negro",
    "San Juan de la Costa",
    "San Pablo",
    "Chaitén",
    "Futaleufú",
    "Hualaihué",
    "Palena",
  ],
  "Región de Aysén": [
    "Coyhaique",
    "Lago Verde",
    "Aysén",
    "Cisnes",
    "Guaitecas",
    "Cochrane",
    "O'Higgins",
    "Tortel",
    "Chile Chico",
    "Río Ibáñez",
  ],
  "Región de Magallanes": [
    "Punta Arenas",
    "Laguna Blanca",
    "Río Verde",
    "San Gregorio",
    "Cabo de Hornos",
    "Antártica",
    "Porvenir",
    "Primavera",
    "Timaukel",
    "Natales",
    "Torres del Paine",
  ],
};

export function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();
  const [showPayment, setShowPayment] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    street: "",
    commune: "",
    region: "",
    postal_code: "",
    notes: "",
  });
  const [profileAddress, setProfileAddress] = useState<any>(null);
  const [useProfileAddress, setUseProfileAddress] = useState(false);

  useEffect(() => {
    // Cuando se muestra el panel de pago, obtener la dirección del perfil del usuario
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${backendUrl}/user/${user.user_ID}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setProfileAddress(data);
        // Si el usuario tiene dirección en su perfil, seleccionarla por defecto
        if (data.address || data.region || data.comuna) {
          setUseProfileAddress(true);
          setShippingInfo((prev) => ({
            ...prev,
            street: data.address || "",
            region: data.region || "",
            commune: data.comuna || "",
            postal_code: data.postal_code || "",
          }));
        }
      } catch (err) {
        // Silencioso: si falla la carga del perfil no bloqueamos el pago
      }
    };

    if (showPayment) fetchProfile();
  }, [showPayment]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-8">
            Agrega productos a tu carrito para continuar con tu compra
          </p>
          <Link
            to="/productos"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Carrito de Compras</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
        >
          <TrashIcon className="h-5 w-5" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de productos */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cart_item_ID || item.variant_ID}
              className="bg-white rounded-lg shadow-md p-4 flex gap-4"
            >
              {/* Imagen */}
              <div className="flex-shrink-0">
                {item.image_url ? (
                  <img
                    src={item.image_url
                      .replace("../frontend/public", "")
                      .replace(/^\.\/+/, "/")}
                    alt={item.product_name}
                    className="w-24 h-24 object-cover rounded"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="flex-1">
                <Link
                  to={`/producto/${item.product_ID}`}
                  className="text-lg font-semibold text-gray-800 hover:text-blue-600"
                >
                  {item.product_name}
                </Link>
                <p className="text-sm text-gray-600">{item.brand_name}</p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                  <span>Color: {item.color_name}</span>
                  <span>Talla: {item.size}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Stock disponible: {item.stock}
                </p>
              </div>

              {/* Precio y cantidad */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() =>
                    removeFromCart(item.variant_ID, item.cart_item_ID)
                  }
                  className="text-red-500 hover:text-red-700"
                  title="Eliminar del carrito"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    $
                    {Math.floor(item.price * item.quantity).toLocaleString(
                      "es-CL"
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    ${Math.floor(item.price).toLocaleString("es-CL")} c/u
                  </p>
                </div>

                {/* Control de cantidad */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.variant_ID,
                        item.quantity - 1,
                        item.cart_item_ID
                      )
                    }
                    className="w-8 h-8 rounded bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        item.variant_ID,
                        parseInt(e.target.value) || 1,
                        item.cart_item_ID
                      )
                    }
                    min="1"
                    max={item.stock}
                    className="w-16 text-center border-2 border-gray-200 rounded px-2 py-1"
                  />
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.variant_ID,
                        item.quantity + 1,
                        item.cart_item_ID
                      )
                    }
                    disabled={item.quantity >= item.stock}
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      item.quantity >= item.stock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Resumen del Pedido
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} productos)</span>
                <span className="font-semibold">
                  ${Math.floor(getTotalPrice()).toLocaleString("es-CL")}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span className="font-semibold text-green-600">Gratis</span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-800">
                <span>Total</span>
                <span>
                  ${Math.floor(getTotalPrice()).toLocaleString("es-CL")}
                </span>
              </div>
            </div>

            {!showPayment ? (
              <button
                onClick={() => {
                  if (!user) {
                    // Guardar la ruta actual para redirigir después del login
                    localStorage.setItem("redirectAfterLogin", "/carrito");
                    navigate("/login");
                  } else {
                    setShowPayment(true);
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold transition shadow-lg mb-3"
              >
                {user ? "Proceder al Pago" : "Iniciar sesión para pagar"}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Formulario de dirección de envío */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-3">
                    📦 Dirección de Envío
                  </h3>

                  {/* Opción: usar dirección del perfil o ingresar nueva */}
                  {profileAddress &&
                    (profileAddress.address ||
                      profileAddress.region ||
                      profileAddress.comuna) && (
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Dirección
                        </label>
                        <div className="flex items-center gap-4 text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={useProfileAddress}
                              onChange={() => {
                                setUseProfileAddress(true);
                                setShippingInfo((prev) => ({
                                  ...prev,
                                  street: profileAddress.address || "",
                                  region: profileAddress.region || "",
                                  commune: profileAddress.comuna || "",
                                  postal_code: profileAddress.postal_code || "",
                                }));
                              }}
                            />
                            <span>Usar dirección del perfil</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="addressOption"
                              checked={!useProfileAddress}
                              onChange={() => {
                                setUseProfileAddress(false);
                                setShippingInfo({
                                  street: "",
                                  commune: "",
                                  region: "",
                                  postal_code: "",
                                  notes: "",
                                });
                              }}
                            />
                            <span>Ingresar nueva dirección</span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          {useProfileAddress && (
                            <>
                              {profileAddress.address
                                ? `${profileAddress.address}, `
                                : ""}
                              {profileAddress.comuna
                                ? `${profileAddress.comuna}, `
                                : ""}
                              {profileAddress.region
                                ? profileAddress.region
                                : ""}
                            </>
                          )}
                        </p>
                      </div>
                    )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <select
                        value={shippingInfo.region}
                        onChange={(e) => {
                          setShippingInfo({
                            ...shippingInfo,
                            region: e.target.value,
                            commune: "", // Resetear comuna al cambiar región
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar región</option>
                        <option value="Región de Arica y Parinacota">
                          Arica y Parinacota
                        </option>
                        <option value="Región de Tarapacá">Tarapacá</option>
                        <option value="Región de Antofagasta">
                          Antofagasta
                        </option>
                        <option value="Región de Atacama">Atacama</option>
                        <option value="Región de Coquimbo">Coquimbo</option>
                        <option value="Región de Valparaíso">Valparaíso</option>
                        <option value="Región Metropolitana">
                          Metropolitana
                        </option>
                        <option value="Región del Libertador General Bernardo O'Higgins">
                          O'Higgins
                        </option>
                        <option value="Región del Maule">Maule</option>
                        <option value="Región de Ñuble">Ñuble</option>
                        <option value="Región del Biobío">Biobío</option>
                        <option value="Región de La Araucanía">
                          La Araucanía
                        </option>
                        <option value="Región de Los Ríos">Los Ríos</option>
                        <option value="Región de Los Lagos">Los Lagos</option>
                        <option value="Región de Aysén">Aysén</option>
                        <option value="Región de Magallanes">Magallanes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Comuna *
                      </label>
                      <select
                        value={shippingInfo.commune}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            commune: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!shippingInfo.region}
                      >
                        <option value="">
                          {shippingInfo.region
                            ? "Seleccionar comuna"
                            : "Primero selecciona una región"}
                        </option>
                        {shippingInfo.region &&
                          comunasPorRegion[shippingInfo.region]?.map(
                            (comuna) => (
                              <option key={comuna} value={comuna}>
                                {comuna}
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Calle y número *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.street}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            street: e.target.value,
                          })
                        }
                        placeholder="Av. Ejemplo 1234"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      {shippingInfo.street &&
                        !/\d/.test(shippingInfo.street) && (
                          <p className="text-xs text-red-600 mt-1">
                            La dirección debe incluir un número
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Código Postal (opcional)
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postal_code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, ""); // Solo números
                          if (value.length <= 7) {
                            setShippingInfo({
                              ...shippingInfo,
                              postal_code: value,
                            });
                          }
                        }}
                        placeholder="1234567"
                        maxLength={7}
                        pattern="[0-9]{7}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {shippingInfo.postal_code &&
                        shippingInfo.postal_code.length !== 7 && (
                          <p className="text-xs text-red-600 mt-1">
                            El código postal debe tener exactamente 7 dígitos
                          </p>
                        )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        value={shippingInfo.notes}
                        onChange={(e) =>
                          setShippingInfo({
                            ...shippingInfo,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Ej: Dejar en portería, timbre roto, etc."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-green-900 mb-2">
                    💳 Selecciona tu método de pago
                  </h3>
                  <p className="text-xs text-green-700">
                    Pago seguro con PayPal - Acepta tarjetas de crédito/débito
                  </p>
                </div>

                {/* Botón de PayPal - solo se muestra si hay dirección */}
                {shippingInfo.street &&
                shippingInfo.commune &&
                shippingInfo.region ? (
                  <div>
                    <PayPalButton
                      amount={parseFloat((getTotalPrice() / 900).toFixed(2))} // Convertir CLP a USD (aproximado)
                      description={`Compra de ${items.length} producto(s)`}
                      peticionId={0}
                      onSuccess={async (data) => {
                        try {
                          // 1. Crear el pedido (estado: pendiente)
                          const paymentInfo = `Pedido pagado via PayPal - ${data.orderID}`;
                          const combinedNotes = shippingInfo.notes
                            ? `${shippingInfo.notes} | ${paymentInfo}`
                            : paymentInfo;

                          const orderResponse = await axios.post(
                            `${backendUrl}/orders`,
                            {
                              items: items,
                              total_price: getTotalPrice(),
                              paypal_order_id: data.orderID,
                              street: shippingInfo.street,
                              region: shippingInfo.region,
                              commune: shippingInfo.commune,
                              postal_code: shippingInfo.postal_code || null,
                              notes: combinedNotes,
                            },
                            { withCredentials: true }
                          );

                          // 2. Confirmar el pago (cambiar estado a: pagado)
                          await axios.post(
                            `${backendUrl}/orders/confirm-payment`,
                            {
                              orderId: orderResponse.data.order_ID,
                              paypalOrderId: data.orderID,
                            },
                            { withCredentials: true }
                          );

                          clearCart();
                          navigate("/payment/success");
                        } catch (error) {
                          alert(
                            "El pago fue exitoso pero hubo un error al guardar el pedido. Por favor contacta a soporte."
                          );
                        }
                      }}
                      onError={(error) => {
                        alert(
                          "Hubo un error al procesar el pago. Por favor intenta nuevamente."
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <p className="text-xs text-yellow-800">
                      ⚠️ Completa la dirección de envío (región, comuna y calle)
                      para continuar con el pago
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setShowPayment(false)}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-medium transition text-sm"
                >
                  ← Volver
                </button>
              </div>
            )}

            <Link
              to="/productos"
              className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition mt-3"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
