import { useState, useEffect } from "react";

type Variant = {
  color_ID: number;
  size: string;
  price: string;
  stock: string;
  sku: string;
  images: File[];
};

type Category = { category_ID: number; name: string };
type Color = { color_ID: number; name: string };
type Brand = { brand_id: number; name: string };

type ExistingImages = { color_ID: number; urls: string[] };

function AddProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category_ID, setCategoryID] = useState<number | "">("");
  const [brand_ID, setBrandID] = useState<number | "">("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [variants, setVariants] = useState<Variant[]>([
    { color_ID: 0, size: "", price: "", stock: "", sku: "", images: [] },
  ]);
  const [existingImages, setExistingImages] = useState<ExistingImages[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/categories").then((res) =>
      res.json().then(setCategories).catch(console.error)
    );
    fetch("http://localhost:3000/colors").then((res) =>
      res.json().then(setColors).catch(console.error)
    );
    fetch("http://localhost:3000/brands").then((res) =>
      res.json().then(setBrands).catch(console.error)
    );
  }, []);

  const handleVariantChange = (
    index: number,
    field: keyof Variant,
    value: string | number | File[]
  ) => {
    const updated = [...variants];
    updated[index][field] = value as never;
    setVariants(updated);

    // Actualizar existingImages si se suben imágenes nuevas
    if (field === "images" && value instanceof Array && value.length > 0) {
      const colorID = updated[index].color_ID;
      setExistingImages((prev) => [
        ...prev.filter((img) => img.color_ID !== colorID),
        {
          color_ID: colorID,
          urls: value.map((file) => URL.createObjectURL(file)),
        },
      ]);
    }
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { color_ID: 0, size: "", price: "", stock: "", sku: "", images: [] },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || category_ID === "" || brand_ID === "") {
      alert("Completa todos los campos obligatorios");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category_ID", String(category_ID));
    formData.append("brand_id", String(brand_ID));

    variants.forEach((v, i) => {
      formData.append(
        `variants[${i}]`,
        JSON.stringify({
          color_ID: v.color_ID,
          size: v.size,
          price: v.price,
          stock: v.stock,
          sku: v.sku,
        })
      );

      if (v.images.length > 0) {
        v.images.forEach((file) =>
          formData.append(`variantImages[${i}]`, file)
        );
      }
    });

    try {
      const res = await fetch("http://localhost:3000/add-product", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.message || data.error);

      if (res.ok) {
        setName("");
        setDescription("");
        setCategoryID("");
        setBrandID("");
        setVariants([
          { color_ID: 0, size: "", price: "", stock: "", sku: "", images: [] },
        ]);
        setExistingImages([]);
      }
    } catch (err) {
      console.error(err);
      alert("Error al crear producto");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-4xl w-full mx-auto bg-white p-6 rounded-2xl shadow"
    >
      <h2 className="text-2xl font-bold text-gray-800">Añadir producto</h2>

      {/* Marca y Nombre */}
      <div className="grid grid-cols-3 gap-2 mb-3 items-center">
        <div>
          <label className="block font-medium">Marca</label>
          <select
            value={brand_ID}
            onChange={(e) => setBrandID(Number(e.target.value))}
            className="border p-2 rounded w-full"
            required
          >
            <option value="">-- Selecciona una marca --</option>
            {brands.map((b) => (
              <option key={b.brand_id} value={b.brand_id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block font-medium">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del producto"
            className="border p-3 w-full rounded"
            required
          />
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
          className="border p-2 w-full rounded"
        />
      </div>

      {/* Categoría */}
      <div>
        <label className="block font-medium">Categoría</label>
        <select
          value={category_ID}
          onChange={(e) => setCategoryID(Number(e.target.value))}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">-- Selecciona una categoría --</option>
          {categories.map((c) => (
            <option key={c.category_ID} value={c.category_ID}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <h3 className="text-xl font-semibold text-gray-700 mt-6">
        Variantes del producto
      </h3>

      {variants.map((v, i) => {
        const imagesForColor = existingImages.find(
          (img) => img.color_ID === v.color_ID
        )?.urls;

        return (
          <div key={i} className="grid grid-cols-6 gap-2 mb-3 items-center">
            {/* Color */}
            <select
              value={v.color_ID}
              onChange={(e) =>
                handleVariantChange(i, "color_ID", Number(e.target.value))
              }
              className="border p-2 rounded"
            >
              <option value="">Seleccionar color...</option>
              {colors.map((c) => (
                <option key={c.color_ID} value={c.color_ID}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Talla */}
            <input
              type="text"
              placeholder="Talla"
              value={v.size}
              onChange={(e) => handleVariantChange(i, "size", e.target.value)}
              className="border p-2 rounded"
            />

            {/* Precio */}
            <input
              type="number"
              placeholder="Precio"
              value={v.price}
              onChange={(e) => handleVariantChange(i, "price", e.target.value)}
              className="border p-2 rounded"
            />

            {/* Stock */}
            <input
              type="number"
              placeholder="Stock"
              value={v.stock}
              onChange={(e) => handleVariantChange(i, "stock", e.target.value)}
              className="border p-2 rounded"
            />

            {/* SKU */}
            <input
              type="text"
              placeholder="SKU"
              value={v.sku}
              onChange={(e) => handleVariantChange(i, "sku", e.target.value)}
              className="border p-2 rounded"
            />

            {/* Eliminar variante */}
            <button
              type="button"
              onClick={() => removeVariant(i)}
              className="bg-red-500 text-white rounded px-2 py-1 hover:bg-red-600"
            >
              🗑️
            </button>

            {/* Imágenes */}
            {imagesForColor && imagesForColor.length > 0 ? (
              <div className="col-span-5 flex gap-2 mt-2">
                {imagesForColor.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`imagen ${idx}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            ) : (
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files)
                    handleVariantChange(
                      i,
                      "images",
                      Array.from(e.target.files)
                    );
                }}
                className="border p-2 rounded col-span-5"
              />
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addVariant}
        className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
      >
        + Añadir variante
      </button>

      <button
        type="submit"
        className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700 mt-4"
      >
        Guardar producto
      </button>
    </form>
  );
}

export default AddProductForm;
