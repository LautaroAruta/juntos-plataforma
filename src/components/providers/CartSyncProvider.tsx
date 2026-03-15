"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

/**
 * CartSyncProvider
 * 
 * Se encarga de sincronizar el carrito local con la nube cuando
 * el estado de la sesión cambia (login/logout).
 */
export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { loadFromCloud, syncWithCloud, items } = useCartStore();

  useEffect(() => {
    if (status === "authenticated") {
      // Al loguearse, traemos el carrito de la nube y hacemos merge
      loadFromCloud();
    }
  }, [status, loadFromCloud]);

  return <>{children}</>;
}
