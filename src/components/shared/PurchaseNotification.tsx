"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Notification {
  id: string;
  userName: string;
  productName: string;
}

export default function PurchaseNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new orders
    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          const newOrder = payload.new;
          
          // Fetch user and product names
          const { data: orderDetails } = await supabase
            .from('orders')
            .select(`
              users (nombre),
              group_deals (
                products (nombre)
              )
            `)
            .eq('id', newOrder.id)
            .single();

          if (orderDetails) {
            const userName = (orderDetails.users as any)?.nombre || "Alguien";
            const productName = (orderDetails.group_deals as any)?.products?.nombre || "un producto";

            const id = Math.random().toString(36).substr(2, 9);
            setNotification({ id, userName, productName });

            // Auto-hide after 5 seconds
            setTimeout(() => {
              setNotification((prev) => (prev?.id === id ? null : prev));
            }, 5000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (!notification) return null;

  return (
    <div className="fixed bottom-8 left-8 z-[100] pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-2xl p-4 shadow-2xl shadow-slate-200/50 flex items-center gap-4 max-w-sm pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-[#00AEEF] flex items-center justify-center text-white shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Actividad Reciente</p>
              <p className="text-sm font-bold text-slate-700 leading-tight">
                <span className="text-[#00AEEF]">{notification.userName}</span> se sumó a la oferta de <span className="text-slate-900">{notification.productName}</span>
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
