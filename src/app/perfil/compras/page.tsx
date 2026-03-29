"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { 
  ShoppingBag, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  ChevronRight,
  Loader2,
  Users,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import OrderQRModal from "@/components/orders/OrderQRModal";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MisComprasPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          group_deal:group_deals (
            id,
            participantes_actuales,
            min_participantes,
            estado,
            fecha_vencimiento,
            product:products (
              id,
              nombre,
              imagen_principal
            )
          ),
          pickup_point:pickup_points (
            id,
            name,
            address
          )
        `)
        .eq('user_id', session.user.id)
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    if (session) fetchOrders();
  }, [session]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pagado':
        return { label: 'Pagado', color: 'bg-green-500', icon: CheckCircle2 };
      case 'pendiente_pago':
        return { label: 'Pendiente de Pago', color: 'bg-amber-500', icon: Clock };
      case 'pendiente_retiro':
        return { label: 'Listo para Retiro', color: 'bg-[#009EE3]', icon: MapPin };
      case 'entregado':
        return { label: 'Entregado', color: 'bg-slate-400', icon: CheckCircle2 };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-red-500', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-400', icon: ShoppingBag };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
        <Loader2 className="animate-spin text-bandha-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7] pb-24 pt-12">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-[0.8]">
              Mis Compras
            </h1>
            <p className="text-slate-500 font-bold ml-1 uppercase text-xs tracking-widest">
              Seguimiento de pedidos y retiros
            </p>
          </div>
          <Link href="/" className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 text-xs font-black uppercase tracking-widest text-[#009EE3] hover:shadow-md transition-all active:scale-95">
            Volver a la Tienda
          </Link>
        </header>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[3rem] p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Aún no tienes compras</h3>
            <p className="text-slate-500 font-medium mb-8">Sumate a una oferta grupal y ahorrá hasta un 40%.</p>
            <Link href="/" className="inline-flex bg-bandha-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-bandha-primary/20 hover:-translate-y-1 transition-all active:scale-95">
              Ver Ofertas Disponibles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const status = getStatusConfig(order.estado);
              const progress = order.group_deal ? (order.group_deal.participantes_actuales / order.group_deal.min_participantes) * 100 : 0;
              const isDealActive = order.group_deal?.estado === 'activo';

              return (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Product Info */}
                    <div className="flex gap-5 md:w-1/2">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                        <img 
                          src={order.group_deal?.product?.imagen_principal || "/placeholder.jpg"} 
                          className="w-full h-full object-cover"
                          alt={order.group_deal?.product?.nombre}
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`${status.color} w-2 h-2 rounded-full`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {status.label}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight mb-2">
                          {order.group_deal?.product?.nombre}
                        </h3>
                        <div className="flex items-center gap-3">
                           <span className="text-sm font-black text-[#00A650]" suppressHydrationWarning>{formatCurrency(order.total)}</span>
                           <span className="text-[10px] font-bold text-slate-400">Orden #{order.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress or Actions */}
                    <div className="md:w-1/2 flex flex-col justify-center gap-5 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                      {isDealActive && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.1em]">
                            <span className="text-[#009EE3] flex items-center gap-1.5">
                              <Users size={14} /> Progreso del Grupo
                            </span>
                            <span className="text-slate-400">
                              {order.group_deal.participantes_actuales}/{order.group_deal.min_participantes}
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, progress)}%` }}
                              className="h-full bg-gradient-to-r from-[#009EE3] to-[#00A650] rounded-full"
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold italic">
                            Faltan {Math.max(0, order.group_deal.min_participantes - order.group_deal.participantes_actuales)} participantes para activar el precio grupal.
                          </p>
                        </div>
                      )}

                      {!isDealActive && order.estado === 'pagado' && (
                        <div className="flex items-start gap-4 bg-green-50 p-4 rounded-2xl border border-green-100">
                           <CheckCircle2 size={20} className="text-green-500 shrink-0 mt-0.5" />
                           <div>
                             <p className="text-[11px] font-black text-green-700 uppercase tracking-tight">Grupo Completado</p>
                             <p className="text-[10px] text-green-600 font-bold opacity-80 leading-relaxed">
                               ¡La oferta fue un éxito! Ya podés retirar tu pedido en el punto seleccionado.
                             </p>
                           </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {order.estado === 'pagado' && order.delivery_token && (
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsQRModalOpen(true);
                            }}
                            className="flex-1 bg-slate-800 text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95 shadow-lg shadow-slate-200"
                          >
                            <QrCode size={18} />
                            Ver Código QR
                          </button>
                        )}
                        {order.pickup_point && (
                          <div className="flex-1 bg-slate-50 border border-slate-100 p-3 rounded-2xl flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#009EE3] shadow-sm">
                               <MapPin size={18} />
                             </div>
                             <div className="min-w-0">
                                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Retiro en</span>
                                <span className="block text-[10px] font-black text-slate-700 truncate">{order.pickup_point.name}</span>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <OrderQRModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        orderId={selectedOrder?.id || ""}
        deliveryToken={selectedOrder?.delivery_token || ""}
        productName={selectedOrder?.group_deal?.product?.nombre || "Producto"}
      />
    </div>
  );
}
