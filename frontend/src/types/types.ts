export type Product = {
  product_ID: number;
  category_ID: number;
  gender: "Hombre" | "Mujer" | "Unisex";
  name: string;
  description: string;
  created_at: string;
  brand_id: number;
  main_color_ID: number;
  supplier_ID: number;
  is_active: boolean;
  main_image?: string;
  variants: Variant[];
};

export type Variant = {
  variant_id?: number;
  tempId?: string; // Para variantes nuevas que aún no tienen ID en la base de datos
  isNew: boolean;
  color_ID: number;
  size: string;
  price: number;
  stock: number;
  is_active: boolean;
  sku: string;
  images: VariantImage[];
  mainImageIndex?: number;
};
export type VariantImage = {
  image_id?: number; // existe si la imagen ya está persistida en DB
  tempId?: string; // id temporal para imágenes nuevas en memoria
  url: string;
  file?: File; // sólo presente para imágenes recién seleccionadas
  is_main: boolean;
  color_id: number;
};

export type Category = {
  category_ID: number;
  name: string;
  size_type?: string;
};

export type Brand = {
  brand_id: number;
  name: string;
};

export type Supplier = {
  supplier_ID: number;
  phone: string;
  email: string;
  name: string;
  created_at: string;
};

export type Color = {
  color_ID: number;
  name: string;
};
