import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Product,
  Variant,
  VariantImage,
  Category,
  Brand,
  Supplier,
  Color,
} from "../types/types";
import * as productService from "../services/productService";

type ProductContextType = {
  products: Product[];
  selectedProduct: Product | null;
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  setSelectedProduct: (p: Product | null) => void;
  variants: Variant[];
  setVariants: (v: Variant[]) => void;
  colors: Color[];
  loading: boolean;
  saving: boolean;
  deleting: boolean;
  selectProduct: (productId: number) => Promise<Product | null>;
  addVariant: () => void;
  updateVariant: (id: number | string, key: keyof Variant, value: any) => void;
  saveProduct: (
    productData?: Product,
    variantsData?: Variant[]
  ) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  refreshProducts: () => Promise<void>;
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Carga inicial de productos y colores
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prods, cols, cats, brs, sups] = await Promise.all([
          productService.getProducts(),
          productService.getColors(),
          productService.getCategories(),
          productService.getBrands(),
          productService.getSuppliers(),
        ]);
        setProducts(prods || []);
        setColors(cols || []);
        setCategories(cats || []);
        setBrands(brs || []);
        setSuppliers(sups || []);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectProduct = async (productId: number) => {
    setLoading(true);
    const product = await productService.getProduct(productId);
    setSelectedProduct(product);
    setVariants(product.variants || []);
    setLoading(false);
    return product;
  };

  const refreshProducts = async () => {
    try {
      const prods = await productService.getProducts();
      setProducts(prods || []);
    } catch (err) {}
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        isNew: true,
        color_ID: 0,
        size: "",
        price: 0,
        stock: 0,
        is_active: true,
        sku: "",
        images: [],
      },
    ]);
  };

  const updateVariant = (
    id: number | string,
    key: keyof Variant,
    value: any
  ) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.variant_id === id || v.tempId === id ? { ...v, [key]: value } : v
      )
    );
  };

  const saveProduct = async (
    productData?: Product,
    variantsData?: Variant[]
  ) => {
    const product = productData || selectedProduct;
    const variantsToSave = variantsData || variants;

    if (!product) return;
    setSaving(true);

    try {
      const formData = new FormData();
      variantsToSave.map((v) => ({
        variant_id: v.variant_id,
        tempId: v.tempId,
        isNew: v.isNew,
        color_ID: v.color_ID,
        size: v.size,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        is_active: v.is_active,
      })),
        null,
        2;
      formData.append("name", product.name);
      formData.append("description", product.description);
      formData.append("category_ID", product.category_ID?.toString() || "");
      formData.append("brand_id", product.brand_id?.toString() || "");
      formData.append("supplier_ID", product.supplier_ID?.toString() || "");
      formData.append("main_color_ID", product.main_color_ID?.toString() || "");
      formData.append("gender", product.gender || "");

      let imageCount = 0;
      const processedImages = new Set<string>(); // Para evitar duplicados

      variantsToSave.forEach((v, i) => {
        // Enviar variant_id si existe (para que el backend sepa qué variante actualizar)
        if (v.variant_id !== undefined) {
          formData.append(
            `variants[${i}][variant_id]`,
            v.variant_id.toString()
          );
        }
        formData.append(`variants[${i}][color_ID]`, v.color_ID.toString());
        formData.append(`variants[${i}][size]`, v.size);
        formData.append(`variants[${i}][price]`, v.price.toString());
        formData.append(`variants[${i}][stock]`, v.stock.toString());
        formData.append(`variants[${i}][sku]`, v.sku);
        formData.append(`variants[${i}][is_active]`, v.is_active.toString());

        // Solo enviar imágenes NUEVAS (las que tienen file pero NO tienen image_id)
        // Y solo una vez por color (evitar duplicados si hay múltiples variantes del mismo color)
        v.images.forEach((img, idx) => {
          if (img.file && !img.image_id) {
            // Usar tempId o nombre de archivo como clave única para evitar duplicados
            const imageKey = img.tempId || img.file.name;
            if (!processedImages.has(imageKey)) {
              formData.append(`variants[${i}][images][${idx}]`, img.file);
              processedImages.add(imageKey);
              imageCount++;
            }
          }
        });

        if (v.mainImageIndex !== undefined)
          formData.append(
            `variants[${i}][mainImageIndex]`,
            v.mainImageIndex.toString()
          );
      });

      await productService.updateProduct(product.product_ID!, formData);
      await selectProduct(product.product_ID!);
      await refreshProducts(); // Recargar la lista de productos
    } catch (err) {
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (productId: number) => {
    setDeleting(true);
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.product_ID !== productId));
      setSelectedProduct(null);
      setVariants([]);
    } catch (err) {
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        selectedProduct,
        setSelectedProduct,
        variants,
        setVariants,
        colors,
        categories,
        brands,
        suppliers,
        loading,
        saving,
        deleting,
        selectProduct,
        addVariant,
        updateVariant,
        saveProduct,
        deleteProduct,
        refreshProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProductContext must be used within ProductProvider");
  return context;
};
