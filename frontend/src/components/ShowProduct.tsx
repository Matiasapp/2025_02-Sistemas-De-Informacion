import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/AlertaToast";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Image = {
  url: string;
  is_main: boolean;
  image_id: number;
  color_id: number;
};

type Variant = {
  variant_ID: number;
  product_id: number;
  color_ID: number;
  size: string;
  price: number;
  stock: number;
  sku: string;
  is_active: number;
  images: Image[];
};

type Product = {
  product_ID: number;
  name: string;
  description?: string;
  category_ID: number;
  brand_id: number;
  supplier_ID: number;
  main_color_ID: number;
  gender: string;
  is_active: number;
  variants: Variant[];
};

type Color = {
  color_ID: number;
  name: string;
};

type Category = {
  category_ID: number;
  name: string;
};

type Brand = {
  brand_id: number;
  name: string;
};

function ProductPage() {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const { showToast } = useToast();
  const [colors, setColors] = useState<Color[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, colorsRes, categoriesRes, brandsRes] =
          await Promise.all([
            fetch(`${backendUrl}/products/${id}`),
            fetch(`${backendUrl}/colors`),
            fetch(`${backendUrl}/categories`),
            fetch(`${backendUrl}/brands`),
          ]);

        const productData = await productRes.json();
        const colorsData = await colorsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();

        setProduct(productData);
        setColors(colorsData);
        setCategories(categoriesData);
        setBrands(brandsData);

        // Seleccionar color principal por defecto
        if (productData.main_color_ID) {
          setSelectedColor(productData.main_color_ID);

          // Buscar imagen principal del color seleccionado
          const mainColorVariants = productData.variants.filter(
            (v: Variant) => v.color_ID === productData.main_color_ID
          );
          if (
            mainColorVariants.length > 0 &&
            mainColorVariants[0].images.length > 0
          ) {
            const mainImg = mainColorVariants[0].images.find(
              (img: Image) => img.is_main
            );
            setSelectedImage(
              mainImg ? mainImg.url : mainColorVariants[0].images[0].url
            );
          }
        }
      } catch (err) {}
    };

    if (id) fetchData();
  }, [id]);

  if (!product) return <p className="p-8">Cargando...</p>;

  const categoryName = categories.find(
    (c) => c.category_ID === product.category_ID
  )?.name;
  const brandName = brands.find((b) => b.brand_id === product.brand_id)?.name;

  // Obtener colores disponibles
  const availableColors = Array.from(
    new Set(product.variants.filter((v) => v.is_active).map((v) => v.color_ID))
  );

  // Obtener tallas disponibles para el color seleccionado
  const availableSizes = selectedColor
    ? product.variants
        .filter(
          (v) => v.color_ID === selectedColor && v.is_active && v.stock > 0
        )
        .map((v) => v.size)
    : [];

  // Obtener imágenes del color seleccionado
  const currentImages = selectedColor
    ? product.variants.find((v) => v.color_ID === selectedColor)?.images || []
    : [];

  // Calcular precio del producto
  const prices = product.variants
    .filter((v) => v.is_active)
    .map((v) => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Obtener variante seleccionada
  const selectedVariant = product.variants.find(
    (v) => v.color_ID === selectedColor && v.size === selectedSize
  );

  // Obtener precio del color seleccionado (cuando no hay talla seleccionada)
  const selectedColorVariants = selectedColor
    ? product.variants.filter(
        (v) => v.color_ID === selectedColor && v.is_active
      )
    : [];
  const colorPrices = selectedColorVariants.map((v) => v.price);
  const colorMinPrice =
    colorPrices.length > 0 ? Math.min(...colorPrices) : null;
  const colorMaxPrice =
    colorPrices.length > 0 ? Math.max(...colorPrices) : null;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize || !selectedVariant || !product) {
      showToast("Por favor selecciona color y talla", "warning");
      return;
    }

    // Validar que la cantidad no exceda el stock disponible
    if (quantity > selectedVariant.stock) {
      showToast(
        `Solo hay ${selectedVariant.stock} unidades disponibles en stock`,
        "warning"
      );
      return;
    }

    const colorName =
      colors.find((c) => c.color_ID === selectedColor)?.name || "Sin nombre";
    const mainImage =
      selectedVariant.images.find((img) => img.is_main)?.url ||
      selectedVariant.images[0]?.url;

    addToCart(
      {
        variant_ID: selectedVariant.variant_ID,
        product_ID: product.product_ID,
        product_name: product.name,
        brand_name: brandName || "Sin marca",
        color_name: colorName,
        size: selectedSize,
        price: selectedVariant.price,
        image_url: mainImage,
        stock: selectedVariant.stock,
      },
      quantity
    );

    // Mostrar confirmación y opción de ir al carrito
    const goToCart = window.confirm(
      `✓ Producto agregado al carrito\n\n${quantity} x ${product.name}\nTalla: ${selectedSize}\nColor: ${colorName}\n\n¿Deseas ir al carrito?`
    );

    if (goToCart) {
      navigate("/carrito");
    } else {
      // Resetear selección para seguir comprando
      setQuantity(1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <button onClick={() => navigate(-1)} className="hover:text-gray-700">
          ← Volver
        </button>
        {categoryName && (
          <span>
            {" / "}
            <button
              onClick={() =>
                navigate(
                  `/categoria/${categoryName
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`
                )
              }
              className="hover:text-gray-700"
            >
              {categoryName}
            </button>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          {/* Imagen principal */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            {selectedImage ? (
              <img
                src={selectedImage
                  .replace("../frontend/public", "")
                  .replace(/^\.\/+/, "/")}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-gray-400">
                Sin imagen disponible
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {currentImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {currentImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img.url)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === img.url
                      ? "border-blue-500"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={img.url
                      .replace("../frontend/public", "")
                      .replace(/^\.\/+/, "/")}
                    alt={`Vista ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{brandName}</p>

          {/* Precio */}
          <div className="text-3xl font-bold text-gray-900 mb-6">
            {selectedVariant ? (
              // Mostrar precio de la variante seleccionada (color + talla)
              <span>
                ${Math.floor(selectedVariant.price).toLocaleString("es-CL")}
              </span>
            ) : selectedColor &&
              colorMinPrice !== null &&
              colorMaxPrice !== null ? (
              // Mostrar precio del color seleccionado (sin talla)
              colorMinPrice === colorMaxPrice ? (
                <span>
                  ${Math.floor(colorMinPrice).toLocaleString("es-CL")}
                </span>
              ) : (
                <span>
                  ${Math.floor(colorMinPrice).toLocaleString("es-CL")} - $
                  {Math.floor(colorMaxPrice).toLocaleString("es-CL")}
                </span>
              )
            ) : minPrice === maxPrice ? (
              // Todos los productos tienen el mismo precio
              <span>${Math.floor(minPrice).toLocaleString("es-CL")}</span>
            ) : (
              // Rango de precios cuando no hay selección
              <span>
                ${Math.floor(minPrice).toLocaleString("es-CL")} - $
                {Math.floor(maxPrice).toLocaleString("es-CL")}
              </span>
            )}
          </div>

          {/* Descripción */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Selector de color */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Color</h3>
            <div className="flex gap-2">
              {availableColors.map((colorId) => {
                const color = colors.find((c) => c.color_ID === colorId);
                return (
                  <button
                    key={colorId}
                    onClick={() => {
                      setSelectedColor(colorId);
                      setSelectedSize("");
                      const colorVariants = product.variants.filter(
                        (v) => v.color_ID === colorId
                      );
                      if (
                        colorVariants.length > 0 &&
                        colorVariants[0].images.length > 0
                      ) {
                        const mainImg = colorVariants[0].images.find(
                          (img) => img.is_main
                        );
                        setSelectedImage(
                          mainImg ? mainImg.url : colorVariants[0].images[0].url
                        );
                      }
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      selectedColor === colorId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {color?.name || `Color ${colorId}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de talla */}
          {selectedColor && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Talla</h3>
              <div className="flex gap-2 flex-wrap">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 transition ${
                      selectedSize === size
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock disponible */}
          {selectedVariant && (
            <p className="text-sm text-gray-600 mb-4">
              Stock disponible: {selectedVariant.stock} unidades
            </p>
          )}

          {/* Cantidad */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Cantidad</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 border-2 border-gray-200 rounded-lg hover:border-gray-400"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1;
                  const maxStock = selectedVariant?.stock || 999;
                  setQuantity(Math.max(1, Math.min(value, maxStock)));
                }}
                className="w-16 text-center border-2 border-gray-200 rounded-lg px-2 py-1"
                min="1"
                max={selectedVariant?.stock || 999}
              />
              <button
                onClick={() => {
                  const maxStock = selectedVariant?.stock || 999;
                  if (quantity < maxStock) {
                    setQuantity(quantity + 1);
                  } else {
                    showToast(
                      `Stock máximo disponible: ${maxStock}`,
                      "warning"
                    );
                  }
                }}
                disabled={
                  selectedVariant ? quantity >= selectedVariant.stock : false
                }
                className={`px-3 py-1 border-2 rounded-lg ${
                  selectedVariant && quantity >= selectedVariant.stock
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                +
              </button>
            </div>
          </div>

          {/* Botón agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedColor || !selectedSize}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              selectedColor && selectedSize
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Agregar al carrito
          </button>

          {/* Información adicional */}
          <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-semibold">SKU:</span>{" "}
              {selectedVariant?.sku || "Selecciona talla"}
            </p>
            <p>
              <span className="font-semibold">Categoría:</span> {categoryName}
            </p>
            <p>
              <span className="font-semibold">Género:</span>{" "}
              {product.gender === "M"
                ? "Hombre"
                : product.gender === "F"
                ? "Mujer"
                : "Unisex"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductPage;
