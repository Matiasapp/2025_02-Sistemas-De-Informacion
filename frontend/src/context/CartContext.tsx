import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./authcontext";
import { useToast } from "./AlertaToast";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

type CartItem = {
  cart_item_ID?: number; // ID del backend (solo para usuarios autenticados)
  variant_ID: number;
  product_ID: number;
  product_name: string;
  brand_name: string;
  color_name: string;
  size: string;
  price: number;
  quantity: number;
  image_url?: string;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity" | "cart_item_ID">,
    quantity: number
  ) => Promise<void>;
  removeFromCart: (variant_ID: number, cart_item_ID?: number) => Promise<void>;
  updateQuantity: (
    variant_ID: number,
    quantity: number,
    cart_item_ID?: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncCartOnLogin: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousUser, setPreviousUser] = useState<any>(null);

  // Cargar carrito al iniciar
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        // Usuario autenticado: cargar desde backend
        await fetchCartFromBackend();
      } else {
        // Usuario invitado: cargar desde localStorage
        const savedCart = localStorage.getItem("cart");
        setItems(savedCart ? JSON.parse(savedCart) : []);
      }
      setLoading(false);
    };

    loadCart();
  }, []);

  // Sincronizar cuando el usuario inicie sesión
  useEffect(() => {
    const handleLoginSync = async () => {
      // Si el usuario acaba de iniciar sesión (antes null, ahora tiene valor)
      if (!previousUser && user) {
        await syncCartOnLogin();
      }
      // Si el usuario cerró sesión (antes tenía valor, ahora null)
      else if (previousUser && !user) {
        // Cargar carrito de localStorage para usuario invitado
        const savedCart = localStorage.getItem("cart");
        setItems(savedCart ? JSON.parse(savedCart) : []);
      }

      setPreviousUser(user);
    };

    if (!loading) {
      handleLoginSync();
    }
  }, [user, loading]);

  // Guardar en localStorage solo para usuarios invitados
  useEffect(() => {
    if (!user && !loading) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, user, loading]);

  // Fetch cart from backend
  const fetchCartFromBackend = async () => {
    try {
      const response = await fetch(`${backendUrl}/cart/get`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {}
  };

  // Sync localStorage cart to backend on login
  const syncCartOnLogin = async () => {
    if (!user) return;

    const localCart = localStorage.getItem("cart");
    if (!localCart) {
      await fetchCartFromBackend();
      return;
    }

    const localItems: CartItem[] = JSON.parse(localCart);
    if (localItems.length === 0) {
      await fetchCartFromBackend();
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/cart/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: localItems }),
      });

      if (response.ok) {
        localStorage.removeItem("cart");
        await fetchCartFromBackend();
      }
    } catch (error) {}
  };

  const addToCart = async (
    item: Omit<CartItem, "quantity" | "cart_item_ID">,
    quantity: number
  ) => {
    if (user) {
      // Usuario autenticado: agregar al backend
      try {
        const payload = {
          variant_ID: item.variant_ID,
          quantity: quantity,
        };

        const response = await fetch(`${backendUrl}/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || "Error al agregar al carrito", "error");
          return;
        }

        if (data.message) {
          showToast(data.message, "info");
        }

        await fetchCartFromBackend();
      } catch (error) {
        showToast("Error al agregar al carrito", "error");
      }
    } else {
      // Usuario invitado: usar localStorage
      setItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.variant_ID === item.variant_ID
        );

        if (existingItem) {
          const newQuantity = Math.min(
            existingItem.quantity + quantity,
            item.stock
          );

          if (existingItem.quantity >= item.stock) {
            showToast(
              `No puedes agregar más. Stock disponible: ${item.stock}`,
              "warning"
            );
            return prevItems;
          }

          if (newQuantity < existingItem.quantity + quantity) {
            showToast(
              `Solo se pueden agregar ${
                item.stock - existingItem.quantity
              } unidades más. Stock máximo: ${item.stock}`,
              "warning"
            );
          }

          return prevItems.map((i) =>
            i.variant_ID === item.variant_ID
              ? { ...i, quantity: newQuantity }
              : i
          );
        } else {
          if (quantity > item.stock) {
            showToast(
              `Solo hay ${item.stock} unidades disponibles en stock`,
              "warning"
            );
            return [...prevItems, { ...item, quantity: item.stock }];
          }
          return [...prevItems, { ...item, quantity }];
        }
      });
    }
  };

  const removeFromCart = async (variant_ID: number, cart_item_ID?: number) => {
    if (user && cart_item_ID) {
      // Usuario autenticado: eliminar del backend
      try {
        const response = await fetch(
          `${backendUrl}/cart/item/${cart_item_ID}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          await fetchCartFromBackend();
        }
      } catch (error) {}
    } else {
      // Usuario invitado: eliminar de localStorage
      setItems((prevItems) =>
        prevItems.filter((item) => item.variant_ID !== variant_ID)
      );
    }
  };

  const updateQuantity = async (
    variant_ID: number,
    quantity: number,
    cart_item_ID?: number
  ) => {
    if (quantity <= 0) {
      await removeFromCart(variant_ID, cart_item_ID);
      return;
    }

    if (user && cart_item_ID) {
      // Usuario autenticado: actualizar en backend
      try {
        const response = await fetch(
          `${backendUrl}/cart/item/${cart_item_ID}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ quantity }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          showToast(data.error || "Error al actualizar cantidad", "error");
          return;
        }

        await fetchCartFromBackend();
      } catch (error) {}
    } else {
      // Usuario invitado: actualizar en localStorage
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.variant_ID === variant_ID
            ? { ...item, quantity: Math.min(quantity, item.stock) }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      // Usuario autenticado: vaciar carrito en backend
      try {
        const response = await fetch(
          `${backendUrl}/cart/clear/${user.user_ID}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          setItems([]);
        }
      } catch (error) {}
    } else {
      // Usuario invitado: vaciar localStorage
      setItems([]);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        syncCartOnLogin,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
