"use client";

import React, { useEffect, useState, useCallback } from "react";
import { 
  QrCode, 
  Package, 
  Users, 
  Clock, 
  ChevronRight, 
  Store, 
  MapPin,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import QRScannerModal from "@/components/shared/QRScannerModal";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function HubDashboard() {
  const [loading, setLoading] = useState(true);
  const [hubData, setHubData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanAction, setScanAction] = useState<'receive' | 'deliver'>('deliver');
  const [activeTab, setActiveTab] = useState<'pending_reception' | 'ready_for_pickup' | 'history'>('ready_for_pickup');
  
  const supabase = createClient();

  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch Hub data
      const { data: hub, error: hError } = await supabase
        .from('pickup_points')
        .select('*')
        .eq('manager_id', user.id)
        .maybeSingle();

      if (hError || !hub) {
        setHubData(null);
        setLoading(false);
        return;
      }
      setHubData(hub);

      // Fetch Orders for this Hub
      const { data: hubOrders } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          estado,
          creado_en,
          user:users (nombre, apellido),
          order_items (
            quantity,
            product:products (nombre)
          )
        `)
        .eq('pickup_point_id', hub.id)
        .order('creado_en', { ascending: false });

      setOrders(hubOrders || []);
    } catch (error) {
      console.error("Error fetching hub data:", error);
      toast.error("Error al cargar los datos del Hub");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleVerify = async (orderId: string) => {
    const res = await fetch("/api/hub/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, action: scanAction }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Error al verificar");
    
    fetchHubData();
  };

  const pendingReception = orders.filter(o => o.estado === 'pagado');
  const readyForPickup = orders.filter(o => o.estado === 'pendiente_retiro');
  const history = orders.filter(o => o.estado === 'entregado');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
      </div>
    );
  }

  if (!hubData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-lg border border-slate-100">
          <Store className="mx-auto text-slate-200 mb-6" size={80} />
          <h1 className="text-2xl font-black text-slate-800 uppercase mb-4">Acceso Restringido</h1>
          <p className="text-slate-500 font-medium mb-8">
            Este panel es solo para encargados de Puntos JUNTOS autorizados. Si tenés un comercio y querés sumarte, contactanos.
          </p>
          <button className="bg-[#009EE3] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-lg shadow-[#009EE3]/20">
            Postular mi Comercio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onVerify={handleVerify}
      />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-[#009EE3]/10 flex items-center justify-center text-[#009EE3]">
                <Store size={40} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-100 text-green-600 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    Punto JUNTOS Activo
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">{hubData.name}</h1>
                <p className="text-slate-500 font-medium flex items-center gap-2">
                  <MapPin size={16} /> {hubData.address}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => { setScanAction('receive'); setIsScannerOpen(true); }}
                className="bg-white border-2 border-slate-100 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 hover:text-[#009EE3] hover:border-[#009EE3]/20 transition-all shadow-sm flex items-center gap-2"
              >
                <Package size={20} /> Recibir Mercadería
              </button>
              <button 
                onClick={() => { setScanAction('deliver'); setIsScannerOpen(true); }}
                className="bg-[#009EE3] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#009EE3]/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                <QrCode size={20} /> Entregar a Vecino
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Package size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Por Recibir</p>
              <p className="text-2xl font-black text-slate-800">{pendingReception.length}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#009EE3]/10 text-[#009EE3] flex items-center justify-center">
              <Users size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Listos p/ Retirar</p>
              <p className="text-2xl font-black text-slate-800">{readyForPickup.length}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Hoy Entregados</p>
              <p className="text-2xl font-black text-slate-800">{history.length}</p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-4 mt-12 mb-8 p-1 bg-slate-200/50 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('pending_reception')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'pending_reception' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Por Recibir ({pendingReception.length})
          </button>
          <button 
            onClick={() => setActiveTab('ready_for_pickup')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'ready_for_pickup' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            En el Hub ({readyForPickup.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Historial
          </button>
        </div>

        {/* Orders List */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {(activeTab === 'pending_reception' ? pendingReception : activeTab === 'ready_for_pickup' ? readyForPickup : history).length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100 shadow-sm">
                 <Package className="mx-auto text-slate-100 mb-6" size={64} />
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No hay pedidos en esta sección</p>
              </div>
            ) : (activeTab === 'pending_reception' ? pendingReception : activeTab === 'ready_for_pickup' ? readyForPickup : history).map((order) => (
              <div key={order.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 hover:shadow-xl hover:shadow-[#009EE3]/5 transition-all group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold uppercase">
                   {order.user?.nombre?.[0] || 'U'}
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                    <h4 className="text-lg font-black text-slate-800 tracking-tight">{order.user?.nombre} {order.user?.apellido}</h4>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase tracking-widest">#{order.id.split('-')[0]}</span>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                    <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(order.creado_en).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5 text-[#009EE3]"><Package size={12} /> {order.order_items?.length} productos</span>
                  </div>
                </div>

                <div className="text-center md:text-right min-w-[120px]">
                   <p className="text-2xl font-black text-slate-800">${Number(order.total).toLocaleString()}</p>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Pedido</p>
                </div>

                <button 
                  onClick={() => { setScanAction(activeTab === 'pending_reception' ? 'receive' : 'deliver'); setIsScannerOpen(true); }}
                  className="bg-slate-50 group-hover:bg-[#009EE3] text-slate-400 group-hover:text-white p-4 rounded-2xl transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
