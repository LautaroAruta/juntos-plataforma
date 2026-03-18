"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Zap, ShoppingBag, Star, Heart, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { useSocialStore } from "@/store/socialStore";

interface NeighborhoodFeedProps {
  neighborhoodId?: string;
}

export function NeighborhoodFeed({ neighborhoodId = "Palermo" }: NeighborhoodFeedProps) {
  const { events, loading, fetchInitialEvents, subscribeToNeighborhood, sendEvent } = useSocialStore();

  useEffect(() => {
    fetchInitialEvents(neighborhoodId);
    const unsubscribe = subscribeToNeighborhood(neighborhoodId);
    return () => unsubscribe();
  }, [neighborhoodId, fetchInitialEvents, subscribeToNeighborhood]);

  const handleCheer = (targetName: string) => {
    sendEvent({
      neighborhood_id: neighborhoodId,
      event_type: 'cheer',
      user_name: "Un vecino",
      target_name: targetName,
      impact_text: "¡Vamos todavía! 🙌"
    });
  };

  if (loading && events.length === 0) {
    return (
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#009EE3] mb-4" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
          Sincronizando pulso barrial...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Zap className="text-amber-400 fill-amber-400" size={20} />
            Pulso del Barrio
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Actividad en tiempo real</p>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
               <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="vecino" />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
            +24
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 overflow-y-auto max-h-[500px] min-h-[400px]">
        <AnimatePresence initial={false}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <Heart className="text-slate-100 mb-4" size={48} />
              <p className="text-xs font-bold text-slate-400 leading-tight">
                Todavía no hay actividad reciente en <span className="text-slate-600">#{neighborhoodId}</span>.
                ¡Sé el primero en participar!
              </p>
            </div>
          ) : (
            events.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-100 relative"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  item.event_type === 'deal_joined' ? 'bg-blue-50 text-blue-500' :
                  item.event_type === 'deal_closed' ? 'bg-green-50 text-green-500' :
                  item.event_type === 'review_posted' ? 'bg-amber-50 text-amber-500' :
                  item.event_type === 'milestone_reached' ? 'bg-purple-50 text-purple-500' :
                  'bg-red-50 text-red-500'
                }`}>
                  {item.event_type === 'deal_joined' && <Users size={20} />}
                  {item.event_type === 'deal_closed' && <ShoppingBag size={20} />}
                  {item.event_type === 'review_posted' && <Star size={20} />}
                  {item.event_type === 'milestone_reached' && <Heart size={20} />}
                  {item.event_type === 'cheer' && <Zap size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-slate-500 leading-tight">
                      <span className="font-black text-slate-800">{item.user_name}</span> {
                        item.event_type === 'deal_joined' ? 'se unió a' :
                        item.event_type === 'deal_closed' ? 'completó' :
                        item.event_type === 'review_posted' ? 'dejó una reseña en' :
                        item.event_type === 'milestone_reached' ? 'alcanzó' :
                        'alentó la compra de'
                      }
                    </p>
                    <span className="text-[9px] font-bold text-slate-300 whitespace-nowrap ml-2">
                      {formatDistanceToNow(new Date(item.creado_en), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-800 tracking-tight leading-tight mb-2 truncate">
                    {item.target_name}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {item.impact_text && (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        item.event_type === 'deal_joined' ? 'bg-blue-500 text-white' :
                        item.event_type === 'deal_closed' ? 'bg-green-500 text-white' :
                        'bg-slate-800 text-white'
                      }`}>
                        {item.impact_text}
                      </div>
                    )}
                    
                    {item.event_type !== 'cheer' && (
                      <button 
                        onClick={() => handleCheer(item.target_name)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 active:scale-95"
                        title="Alentar esta compra"
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <button className="p-6 text-center border-t border-slate-50 text-[10px] font-black text-[#009EE3] uppercase tracking-[0.2em] hover:bg-slate-50 transition-colors mt-auto">
        Ver Toda la Actividad
      </button>
    </div>
  );
}
