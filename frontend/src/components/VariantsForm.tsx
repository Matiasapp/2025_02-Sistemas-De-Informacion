import React from "react";
import type { Variant, Color } from "../types/types";

interface VariantsFormProps {
  variants: Variant[];
  colors: Color[];
  addVariant: () => void;
  updateVariant: (id: number | string, key: keyof Variant, value: any) => void;
}

export const VariantsForm: React.FC<VariantsFormProps> = ({
  variants,
  colors,
  addVariant,
  updateVariant,
}) => {
  // Agrupar variantes por color
  const variantsByColor: Record<number, Variant[]> = {};
  variants.forEach((v) => {
    if (!variantsByColor[v.color_ID]) variantsByColor[v.color_ID] = [];
    variantsByColor[v.color_ID].push(v);
  });

  return (
    <div>
      {Object.entries(variantsByColor).map(([colorId, colorVariants]) => {
        const color = colors.find((c) => c.color_ID === Number(colorId));
        const representativeVariant = colorVariants[0]; // para las imágenes y subir nuevas

        return (
          <div key={colorId} className="mb-6 border-b pb-4">
            <h4 className="font-semibold mb-2">{color?.name}</h4>

            {/* Renderizar todas las variantes de este color */}
            {colorVariants.map((v) => (
              <div
                key={v.variant_id || v.tempId}
                className="grid grid-cols-4 gap-2 items-center mb-2"
              >
                <input
                  type="text"
                  value={v.size}
                  onChange={(e) =>
                    updateVariant(
                      v.variant_id || v.tempId!,
                      "size",
                      e.target.value
                    )
                  }
                  placeholder="Tamaño"
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) =>
                    updateVariant(
                      v.variant_id || v.tempId!,
                      "price",
                      Number(e.target.value)
                    )
                  }
                  placeholder="Precio"
                  className="border p-1 rounded"
                />
                <input
                  type="number"
                  value={v.stock}
                  onChange={(e) =>
                    updateVariant(
                      v.variant_id || v.tempId!,
                      "stock",
                      Number(e.target.value)
                    )
                  }
                  placeholder="Stock"
                  className="border p-1 rounded"
                />
              </div>
            ))}

            {/* Imágenes solo una vez por color */}
            <div className="flex flex-wrap gap-2 mt-2">
              {representativeVariant.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.url}
                  alt={color?.name || "Imagen"}
                  className="w-24 h-24 object-cover rounded"
                />
              ))}
            </div>

            {/* Subir nuevas imágenes */}
            <input
              type="file"
              multiple
              className="mt-2"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;
                const newImages = Array.from(files).map((file) => ({
                  image_id: Date.now() + Math.random(),
                  url: URL.createObjectURL(file),
                  file,
                  is_main: false,
                  color_id: representativeVariant.color_ID,
                }));
                updateVariant(
                  representativeVariant.variant_id ||
                    representativeVariant.tempId!,
                  "images",
                  [...representativeVariant.images, ...newImages]
                );
              }}
            />
          </div>
        );
      })}

      <button
        onClick={addVariant}
        className="mt-4 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Agregar Variante
      </button>
    </div>
  );
};
