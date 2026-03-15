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
  // Métodos de sincronización cloud y verificación
  syncWithCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  verifyItems: () => Promise<{ changed: boolean; messages: string[] }>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const cartUniqueId = newItem.variant
            ? `${newItem.id}-${newItem.variant}`
            : newItem.id;

          const existingItemIndex = state.items.findIndex(
            (item) => item.uniqueId === cartUniqueId
          );

          let newItems;
          if (existingItemIndex > -1) {
            newItems = [...state.items];
            const current = newItems[existingItemIndex];
            newItems[existingItemIndex] = {
              ...current,
              quantity: Math.min(current.quantity + newItem.quantity, current.stock),
            };
          } else {
            newItems = [...state.items, {
              ...newItem,
              uniqueId: cartUniqueId,
              quantity: Math.min(newItem.quantity, newItem.stock),
            }];
          }
          
          return { items: newItems };
        });
        get().syncWithCloud();
      },

      removeItem: (uniqueId) => {
        set((state) => ({
          items: state.items.filter((item) => item.uniqueId !== uniqueId),
        }));
        get().syncWithCloud();
      },

      updateQuantity: (uniqueId, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.uniqueId === uniqueId
              ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) }
              : item
          ),
        }));
        get().syncWithCloud();
      },

      clearCart: () => {
        set({ items: [] });
        get().syncWithCloud();
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

      async syncWithCloud() {
        const items = get().items;
        try {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: items.map(i => ({ id: i.id, variant: i.variant, quantity: i.quantity })) })
          });
        } catch (e) {
          // Sync silencioso
        }
      },

      async loadFromCloud() {
        try {
          const res = await fetch('/api/cart/sync');
          if (res.ok) {
            const cloudItems = await res.json();
            if (cloudItems && cloudItems.length > 0) {
               set({ items: cloudItems });
            }
          }
        } catch (e) {
          console.error("Error cargando carrito de la nube:", e);
        }
      },

      async verifyItems() {
        const currentItems = get().items;
        if (currentItems.length === 0) return { changed: false, messages: [] };

        const productIds = Array.from(new Set(currentItems.map(i => i.id)));
        const messages: string[] = [];
        let hasChanges = false;

        try {
          // Llamamos a una API de verificación de productos (podemos reusar la lógica de products)
          const res = await fetch(`/api/products/verify`, {
            method: 'POST',
            body: JSON.stringify({ ids: productIds })
          });

          if (!res.ok) return { changed: false, messages: [] };
          const freshData = await res.json();

          const updatedItems = currentItems.map(item => {
            const fresh = freshData.find((f: any) => f.id === item.id);
            if (!fresh) return item;

            let newItem = { ...item };
            
            // 1. Verificar Precio
            if (Number(fresh.precio_individual) !== item.price) {
              newItem.price = Number(fresh.precio_individual);
              messages.push(`El precio de ${item.name} se actualizó.`);
              hasChanges = true;
            }

            // 2. Verificar Stock
            if (fresh.stock < item.quantity) {
              newItem.quantity = fresh.stock;
              messages.push(`No hay suficiente stock de ${item.name}. Ajustado al máximo.`);
              hasChanges = true;
            }
            newItem.stock = fresh.stock;

            return newItem;
          });

          if (hasChanges) {
            set({ items: updatedItems });
          }

          return { changed: hasChanges, messages };
        } catch (e) {
          return { changed: false, messages: [] };
        }
      }
    }),
    {
      name: 'bandha-cart-storage',
    }
  )
);
