"use client";

import { Calendar, Package, Pause, Play, Trash2, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useSubscriptionStore, Subscription } from "@/store/subscriptionStore";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function SubscriptionManager() {
  const { data: session } = useSession();
  const { subscriptions, loading, fetchSubscriptions, pauseSubscription, resumeSubscription, removeSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchSubscriptions(session.user.id);
    }
  }, [session?.user?.id, fetchSubscriptions]);

  const handlePauseResume = async (subscription: Subscription) => {
    try {
      if (subscription.status === 'active') {
        await pauseSubscription(subscription.id);
        toast.success("Suscripción pausada correctamente");
      } else {
        await resumeSubscription(subscription.id);
        toast.success("Suscripción reanudada correctamente");
      }
    } catch (error) {
      toast.error("Ocurrió un error al actualizar la suscripción");
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta suscripción?")) {
      await removeSubscription(id);
      toast.success("Suscripción eliminada");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-gray-50 rounded-[2rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
            <RefreshCw className="text-[#009EE3]" size={24} /> Mis Fijos (Suscripciones)
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Gestión de tu alacena inteligente barrial
          </p>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border-2 border-dashed border-gray-100 shadow-sm">
          <Calendar className="mx-auto text-gray-200 mb-4" size={48} />
          <h3 className="text-gray-500 font-black tracking-tight uppercase">Sin suscripciones activas</h3>
          <p className="text-gray-400 text-xs mt-2 max-w-xs mx-auto">
            Suscribite desde la página de producto para automatizar tus básicos y ahorrar un 5% extra.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {subscriptions.map((sub) => (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-white rounded-[2rem] p-6 shadow-sm border ${
                  sub.status === 'paused' ? 'border-orange-100 opacity-75' : 'border-gray-100'
                } transition-all hover:shadow-md relative overflow-hidden`}
              >
                {/* Status Badge Background */}
                {sub.status === 'paused' && (
                  <div className="absolute top-0 right-0 bg-orange-50 text-orange-400 px-6 py-1 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest border-l border-b border-orange-100">
                    Pausada
                  </div>
                )}

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-50 overflow-hidden relative shrink-0">
                    {sub.product?.imagen_principal ? (
                      <img src={sub.product.imagen_principal} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="text-gray-300" size={24} />
                    )}
                  </div>

                  <div className="flex-1 text-center md:text-left min-w-0">
                    <h4 className="font-black text-gray-800 truncate tracking-tight">{sub.product?.nombre}</h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={12} /> {sub.frequency === 'weekly' ? 'Semanal' : sub.frequency === 'biweekly' ? 'Quincenal' : 'Mensual'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#00A650] uppercase tracking-widest">
                        <AlertCircle size={12} /> Próxima: {format(new Date(sub.next_delivery_date), 'dd MMM', { locale: es })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePauseResume(sub)}
                      className={`p-3 rounded-xl border transition-all active:scale-95 ${
                        sub.status === 'active' 
                          ? 'bg-orange-50 border-orange-100 text-orange-500 hover:bg-orange-100' 
                          : 'bg-green-50 border-green-100 text-green-500 hover:bg-green-100'
                      }`}
                      title={sub.status === 'active' ? 'Pausar' : 'Reanudar'}
                    >
                      {sub.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                    </button>
                    <button
                      onClick={() => handleRemove(sub.id)}
                      className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all active:scale-95"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                {sub.status === 'active' && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Ahorro extra acumulado
                    </div>
                    <div className="text-sm font-black text-[#00A650] tracking-tighter">
                      -${(sub.discount_applied || 0).toLocaleString()} (Fidelidad)
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
