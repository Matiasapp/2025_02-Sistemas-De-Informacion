import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const backendUrl = import.meta.env.VITE_BACKEND_URL;

type Product = {
  product_ID: number;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
};

function ProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetch(`${backendUrl}/product/${id}`)
        .then((res) => res.json())
        .then((data) => setProduct(data))
        .catch((err) => console.error(err));
    }
  }, [id]);

  if (!product) return <p>Cargando...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-lg mt-2">Precio: ${product.price}</p>
      <p className="mt-4">{product.description}</p>
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="mt-4 rounded-lg shadow-md w-64"
        />
      )}
    </div>
  );
}

export default ProductPage;
