import { useProductContext } from "../context/ProductContext";

export const useProduct = () => {
  return useProductContext();
};
