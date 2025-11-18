const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const deleteProduct = async (productId: number) => {
  const res = await fetch(`${backendUrl}/products/${productId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Error eliminando producto");
  }
  return await res.json();
};

export const getProducts = async () => {
  const res = await fetch(`${backendUrl}/products`);
  return res.json();
};

export const getProduct = async (productId: number) => {
  const res = await fetch(`${backendUrl}/products/${productId}`);
  return res.json();
};

export const getCategories = async () => {
  const res = await fetch(`${backendUrl}/categories`);
  return res.json();
};

export const getBrands = async () => {
  const res = await fetch(`${backendUrl}/brands`);
  return res.json();
};

export const getSuppliers = async () => {
  const res = await fetch(`${backendUrl}/suppliers`);
  return res.json();
};

export const getColors = async () => {
  const res = await fetch(`${backendUrl}/colors`);
  return res.json();
};

export const updateProduct = async (productId: number, data: FormData) => {
  const res = await fetch(`${backendUrl}/products/${productId}`, {
    method: "PUT",
    credentials: "include",
    body: data,
  });
  return res.json();
};
