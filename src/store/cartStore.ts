import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // ID original del producto o deal
  uniqueId: string; // ID compuesto (id + variante) para diferenciar en el carrito
  name: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
  isGroupDeal?: boolean;
  variant?: string; // Ejemplo: "Rojo - Talle M"
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'uniqueId'>) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Creamos el ID único basado en el ID base y su variante si existe
          const cartUniqueId = newItem.variant
            ? `${newItem.id}-${newItem.variant}`
            : newItem.id;

          const existingItemIndex = state.items.findIndex(
            (item) => item.uniqueId === cartUniqueId
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            const current = updatedItems[existingItemIndex];
            const newQty = current.quantity + newItem.quantity;

            updatedItems[existingItemIndex] = {
              ...current,
              quantity: Math.min(newQty, current.stock),
            };

            return { items: updatedItems };
          }

          // Es un item nuevo
          const itemToInsert: CartItem = {
            ...newItem,
            uniqueId: cartUniqueId,
            quantity: Math.min(newItem.quantity, newItem.stock),
          };

          return {
            items: [...state.items, itemToInsert],
          };
        });
      },

      removeItem: (uniqueId) => {
        set((state) => ({
          items: state.items.filter((item) => item.uniqueId !== uniqueId),
        }));
      },

      updateQuantity: (uniqueId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.uniqueId === uniqueId
              ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
              : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'bandha-cart-storage',
    }
  )
);
