"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  Package, 
  Calendar, 
  CreditCard,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Map as MapIcon
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const PickupMap = dynamic(() => import("@/components/shared/PickupMap"), {
  loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-3xl" />,
  ssr: false,
});

export default function ProviderOrderDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchOrder() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users (*),
          pickup_point:pickup_points (*),
          group_deal:group_deals (
            *,
            product:products (*)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        // Security check
        if (data.provider_id !== session.user.id) {
          router.push("/provider/ordenes");
          return;
        }
        setOrder(data);
      }
      setLoading(false);
    }

    if (session) fetchOrder();
  }, [id, session, supabase, router]);

  const markAsDelivered = async () => {
    if (!confirm("¿Confirmás que el pedido ya fue entregado al cliente?")) return;
    
    setUpdating(true);
    const { error } = await supabase
      .from('orders')
      .update({ 
        estado: 'entregado',
        qr_escaneado: true,
        qr_escaneado_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast.error("Error al actualizar el estado");
    } else {
      toast.success("¡Pedido marcado como entregado!");
      setOrder({ ...order, estado: 'entregado', qr_escaneado: true });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-bandha-primary" size={40} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-slate-200 mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase">Pedido no encontrado</h2>
        <Link href="/provider/ordenes" className="text-bandha-primary font-bold uppercase text-xs tracking-widest mt-4">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* Back Navigation */}
        <Link 
          href="/provider/ordenes"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Listado de Ventas
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* ALERTA DE ARREPENTIMIENTO */}
            {order.arrepentimiento_solicitado && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
                 <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle size={32} />
                 </div>
                 <div className="flex-1 text-center md:text-left space-y-1">
                    <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Venta en proceso de Devolución</h3>
                    <p className="text-sm text-amber-700 font-medium leading-relaxed">
                      El cliente ha ejercido su Derecho de Arrepentimiento. El reembolso automático fue iniciado.
                    </p>
                    {order.motivo_arrepentimiento && (
                       <div className="mt-3 p-3 bg-white/50 rounded-xl border border-amber-100 text-xs text-amber-800 italic">
                          &quot;{order.motivo_arrepentimiento}&quot;
                       </div>
                    )}
                 </div>
                 <div className="shrink-0 font-black text-amber-900 text-sm border-l-2 border-amber-200 pl-6 hidden md:block">
                    {new Date(order.fecha_arrepentimiento).toLocaleDateString()}
                 </div>
              </div>
            )}

            {/* Header / Status Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pedido #{order.id.slice(0, 8)}</span>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.estado === 'entregado' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {order.estado}
                        </div>
                     </div>
                     <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none uppercase">
                        {order.group_deal?.product?.nombre}
                     </h1>
                  </div>
                  <div className="flex gap-3">
                     <Link 
                        href={`/perfil/compras?chat=true&orderId=${order.id}`} // Dummy link, will use OrderChat component
                        className="p-4 rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-500 transition-colors border border-slate-100"
                      >
                        <MessageCircle size={24} />
                     </Link>
                     {order.estado !== 'entregado' && !order.arrepentimiento_solicitado && (
                        <button 
                           onClick={markAsDelivered}
                           disabled={updating}
                           className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-tight shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2"
                        >
                           {updating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                           Marcar Entregado
                        </button>
                     )}
                     {order.arrepentimiento_solicitado && (
                        <div className="px-6 py-4 rounded-2xl border-2 border-dashed border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                           Operación Cancelada
                        </div>
                     )}
                  </div>
               </div>
               
               <div className="mt-10 pt-8 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</span>
                     <span className="block text-sm font-bold text-slate-700">{new Date(order.creado_en).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-1">
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Cantidad</span>
                     <span className="block text-sm font-bold text-slate-700">{order.cantidad} unidades</span>
                  </div>
                  <div className="space-y-1">
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Pago</span>
                     <span className="block text-sm font-black text-[#00A650]">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="space-y-1">
                     <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Token MP</span>
                     <span className="block text-[10px] font-mono text-slate-400 truncate">{order.mp_preference_id || 'N/A'}</span>
                  </div>
               </div>
            </div>

            {/* Logistics Section */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-50">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                        <MapPin size={20} />
                     </div>
                     <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Logística de Entrega</h2>
                  </div>
               </div>
               <div className="p-8 space-y-8">
                  <div className="flex items-start gap-4">
                     <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                           {order.pickup_point?.name || "Local Propio del Proveedor"}
                        </p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md">
                           {order.pickup_point?.address || "Retiro presencial coordinado directamente con el vendedor."}
                        </p>
                     </div>
                  </div>
                  
                  {order.pickup_point && (
                     <div className="h-[300px] rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
                        <PickupMap 
                           points={[order.pickup_point]} 
                           selectedPointId={order.pickup_point.id} 
                           center={[
                              order.pickup_point.latitude,
                              order.pickup_point.longitude
                           ]}
                        />
                     </div>
                  )}
               </div>
            </div>

          </div>

          {/* Sidebar / Customer Info */}
          <div className="space-y-8">
             <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-50">
                <div className="text-center space-y-6">
                   <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-slate-300 mx-auto overflow-hidden">
                      {order.user?.avatar_url ? (
                        <img src={order.user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} />
                      )}
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">
                         {order.user?.nombre} {order.user?.apellido}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 truncate">{order.user?.email}</p>
                   </div>
                   
                   <div className="pt-4 flex flex-col gap-3">
                      <button className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2 border border-slate-100">
                         Ver Perfil de Cliente
                         <ExternalLink size={14} />
                      </button>
                      <button className="w-full py-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] font-bold text-xs uppercase tracking-widest hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-2 border border-[#25D366]/10">
                         WhatsApp Directo
                      </button>
                   </div>
                </div>
             </div>

             {/* Order History Timeline (Simple) */}
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-white/40">Línea de Tiempo</h4>
                <div className="space-y-8 relative">
                   <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/10" />
                   
                   <TimelineItem 
                      title="Pedido Creado" 
                      date={new Date(order.creado_en).toLocaleString()} 
                      active={true} 
                   />
                   <TimelineItem 
                      title="Pago Aprobado" 
                      date={new Date(order.creado_en).toLocaleString()} 
                      active={order.estado !== 'pendiente_pago'} 
                   />
                   {order.arrepentimiento_solicitado && (
                      <TimelineItem 
                         title="Arrepentimiento / Reembolso" 
                         date={new Date(order.fecha_arrepentimiento).toLocaleString()} 
                         active={true}
                         isAlert={true}
                      />
                   )}
                   <TimelineItem 
                      title="Entrega Validada" 
                      date={order.qr_escaneado_at ? new Date(order.qr_escaneado_at).toLocaleString() : 'Pendiente'} 
                      active={order.qr_escaneado} 
                      disabled={order.arrepentimiento_solicitado}
                   />
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function TimelineItem({ title, date, active, isAlert, disabled }: { title: string; date: string; active: boolean; isAlert?: boolean; disabled?: boolean }) {
  return (
    <div className={`flex items-start gap-6 relative group ${disabled ? 'opacity-20' : ''}`}>
      <div className={`w-3 h-3 rounded-full mt-1.5 z-10 border-2 ${
        isAlert ? 'bg-amber-500 border-amber-500 animate-pulse' :
        active ? 'bg-bandha-primary border-bandha-primary shadow-lg shadow-bandha-primary/50' : 
        'bg-slate-800 border-slate-700'
      }`} />
      <div className="space-y-1">
         <p className={`text-xs font-black uppercase tracking-tight transition-colors ${
           isAlert ? 'text-amber-500' :
           active ? 'text-white' : 
           'text-white/20'
         }`}>{title}</p>
         <p className="text-[10px] font-bold text-white/30">{date}</p>
      </div>
    </div>
  );
}
