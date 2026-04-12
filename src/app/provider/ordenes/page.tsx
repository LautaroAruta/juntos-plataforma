"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { 
  Package, 
  MessageCircle, 
  XCircle, 
  Search, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import OrderChat from "@/components/chat/OrderChat";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProviderOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string>("all");
  const [deals, setDeals] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchOrders() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users (
            nombre,
            apellido,
            email
          ),
          pickup_point:pickup_points (
            name,
            address
          ),
          group_deal:group_deals (
            product:products (
              nombre,
              imagen_principal
            )
          )
        `)
        .eq('provider_id', session.user.id)
        .order('creado_en', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }

    if (session) fetchOrders();
  }, [session, supabase]);

  useEffect(() => {
    async function fetchDeals() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('group_deals')
        .select('id, product:products(nombre), creado_en')
        .eq('product:products.provider_id', session.user.id)
        .order('creado_en', { ascending: false })
        .limit(10);
      
      if (data) setDeals(data);
    }
    if (session) fetchDeals();
  }, [session, supabase]);

  const filteredOrders = selectedDealId === "all" 
    ? orders 
    : orders.filter(o => o.group_deal_id === selectedDealId);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!confirm(`¿Confirmar cambio de estado a "${newStatus}"?`)) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, estado: newStatus } : o));
      } else {
        const err = await response.json();
        alert(`Error: ${err.error}`);
      }
    } catch (err) {
      alert("Error al actualizar el estado");
    }
  };

  const handleBatchMessage = async (message: string) => {
    try {
      const response = await fetch('/api/provider/batch-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: selectedDealId, message })
      });
      if (response.ok) {
        alert("Mensaje enviado a todos los chats!");
      }
    } catch (err) {
      alert("Error al enviar mensaje masivo");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-black pb-10">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-[-0.05em] uppercase leading-none italic">
              SLS_REGISTRY
            </h1>
            <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] pl-1">
              CONTROL DE TRANSACCIONES Y LOGÍSTICA // v4.0.2
            </p>
          </div>
          <Link 
            href="/provider/dashboard"
            className="group relative bg-black text-white border-2 border-black px-8 py-4 font-black text-[10px] uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:scale-95 flex items-center gap-3"
          >
            <ChevronLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" /> VOLVER_CONSOLE
          </Link>
        </div>

        {/* Orders List */}
        <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-10 border-b-4 border-black flex flex-col md:flex-row md:items-center justify-between gap-8 bg-black">
             <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} strokeWidth={3} />
                  <input 
                    type="text" 
                    placeholder="BUSCAR_CLIENTE_ID..." 
                    className="w-full bg-white/10 border-2 border-white/20 focus:border-[#FF5C00] py-4 pl-12 pr-4 text-xs font-black uppercase tracking-widest text-white transition-all outline-none placeholder:text-white/20"
                  />
                </div>
                <select 
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="bg-white/10 border-2 border-white/20 focus:border-[#FF5C00] py-4 px-6 text-xs font-black text-white uppercase tracking-widest outline-none transition-all"
                >
                  <option value="all" className="bg-black">TODAS_LAS_OFERTAS</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.id} className="bg-black">
                      {d.product?.nombre.toUpperCase()} [{new Date(d.creado_en).toLocaleDateString()}]
                    </option>
                  ))}
                </select>
                
                {selectedDealId !== "all" && (
                  <button 
                    onClick={() => {
                      const msg = prompt("Escribí el mensaje para todos los compradores de esta oferta:");
                      if (msg) handleBatchMessage(msg);
                    }}
                    className="bg-[#FF5C00] text-black border-2 border-black px-8 py-4 font-black uppercase text-[10px] tracking-widest shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-3 active:scale-95"
                  >
                    <MessageCircle size={16} strokeWidth={3} /> BATCH_MESSAGE
                  </button>
                )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F5F5F5] border-b-2 border-black text-black/40 text-[10px] font-black uppercase tracking-[0.3em]">
                  <th className="px-10 py-6">TIMESTAMP / ID</th>
                  <th className="px-10 py-6">NODE_USER</th>
                  <th className="px-10 py-6">PRODUCT / VAL_TOTAL</th>
                  <th className="px-10 py-6">LOGISTICS_POINT</th>
                  <th className="px-10 py-6">STATUS_FLAG</th>
                  <th className="px-10 py-6 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/5">
                {filteredOrders.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-10 py-32 text-center bg-[#F5F5F5]">
                        <div className="flex flex-col items-center gap-6">
                            <Package className="text-black/10" size={80} strokeWidth={1} />
                            <p className="text-black/30 font-black uppercase text-sm tracking-widest italic">ZERO_TRANSACTIONS_LOGGED</p>
                        </div>
                     </td>
                  </tr>
                ) : filteredOrders.map((order) => (
                  <tr key={order.id} className={`hover:bg-[#F5F5F5] transition-all group ${order.arrepentimiento_solicitado ? 'opacity-60 grayscale' : ''}`}>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <span className="block text-sm font-black text-black italic">
                          {new Date(order.creado_en).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] bg-black text-white px-2 py-1 font-mono tracking-widest">
                             TXN_{order.id.slice(-6).toUpperCase()}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <span className="block text-base font-black text-black uppercase tracking-tighter">
                          {order.user?.nombre} {order.user?.apellido}
                        </span>
                        <span className="block text-[9px] font-mono text-black/40 uppercase tracking-widest truncate max-w-[180px]">
                          ADDR: {order.user?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <span className="block text-sm font-black text-black uppercase italic truncate max-w-[200px]">
                           {order.group_deal?.product?.nombre || 'UNKNOWN_CORE'}
                        </span>
                        <span className="block text-xl font-black text-[#FF5C00] italic leading-none tabular-nums">
                           {formatCurrency(order.total)}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <span className="block text-xs font-black text-black uppercase tracking-tight">
                           {order.pickup_point?.name || 'LOCAL_RETIRE'}
                        </span>
                        <span className="block text-[9px] font-mono text-black/40 uppercase tracking-widest truncate max-w-[150px]">
                           LOC: {order.pickup_point?.address || 'DIRECT_PICKUP'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {order.arrepentimiento_solicitado ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF5C00] text-black border-2 border-black text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <AlertCircle size={14} strokeWidth={3} /> WITHDRAWL_ACT
                        </span>
                      ) : order.estado === 'pendiente_retiro' || order.estado === 'listo_para_retiro' ? (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white border-2 border-[#FF5C00] text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] animate-pulse">
                          READY_FOR_PICKUP
                        </span>
                      ) : order.estado === 'entregado' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-[#FF5C00] border-2 border-black text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 size={14} strokeWidth={3} /> DELIVERED_SYNC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black text-[10px] font-black uppercase tracking-widest italic opacity-50">
                          {order.estado.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-4">
                        {order.estado === 'pagado' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'preparando')}
                            className="bg-black text-white border-2 border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                          >
                            <Package size={16} strokeWidth={3} /> PREP_START
                          </button>
                        )}
                        {order.estado === 'preparando' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'listo_para_retiro')}
                            className="bg-[#FF5C00] text-black border-2 border-black px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} strokeWidth={3} /> MARK_READY
                          </button>
                        )}
                        {order.estado === 'listo_para_retiro' && (
                          <button 
                            onClick={() => handleUpdateStatus(order.id, 'entregado')}
                            className="bg-black text-[#FF5C00] border-2 border-[#FF5C00] px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} strokeWidth={3} /> DELIVER_ACT
                          </button>
                        )}
                        <button 
                          onClick={() => setChatOrderId(order.id)}
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-white text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                          title="OPEN_COMMS"
                        >
                          <MessageCircle size={22} strokeWidth={3} />
                        </button>
                        <Link
                          href={`/perfil/compras`} 
                          className="w-12 h-12 flex items-center justify-center border-2 border-black bg-[#F5F5F5] text-black hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                          title="DATA_DETAIL"
                        >
                          <Package size={22} strokeWidth={3} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Chat Modal */}
      {chatOrderId && session?.user?.id && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setChatOrderId(null)} />
            <div className="relative bg-white border-4 border-black w-full max-w-md overflow-hidden shadow-[20px_20px_0px_0px_rgba(255,92,0,1)] animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setChatOrderId(null)}
                    className="absolute top-4 right-4 z-[110] w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-[#FF5C00] hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                    <XCircle size={20} strokeWidth={4} />
                </button>
                <div className="pt-4 h-[600px]">
                    <OrderChat orderId={chatOrderId} currentUserId={session.user.id} userRole="proveedor" />
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
