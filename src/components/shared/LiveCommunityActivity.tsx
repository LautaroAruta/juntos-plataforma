"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Sparkles, TrendingUp } from "lucide-react";
import { useSocialStore } from "@/store/socialStore";

interface LiveCommunityActivityProps {
  productId: string;
}

export default function LiveCommunityActivity({ productId }: LiveCommunityActivityProps) {
  const { events } = useSocialStore();
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  useEffect(() => {
    // Logic: Look for the most recent event for this product
    const productEvents = events.filter(e => e.product_id === productId);
    
    if (productEvents.length > 0) {
      const latest = productEvents[0]; // Assuming events are sorted newest first
      setCurrentEvent(latest);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setCurrentEvent(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [events, productId]);

  if (!currentEvent) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-none">
      <AnimatePresence>
        {currentEvent && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 pr-6 flex items-center gap-3 backdrop-blur-lg bg-white/90"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00AEEF] to-[#00A650] flex items-center justify-center text-white shrink-0">
               <Users size={18} />
            </div>
            
            <div className="flex flex-col">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                Comunidad Activa
              </p>
              <p className="text-sm font-bold text-slate-800 leading-tight">
                <span className="text-[#00A650]">{currentEvent.user_name}</span> {currentEvent.target_name}
              </p>
              {currentEvent.impact_text && (
                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {currentEvent.impact_text}
                </p>
              )}
            </div>

            <motion.div 
              animate={{ rotate: [0, 15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="ml-2 text-amber-400"
            >
              <Sparkles size={16} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
