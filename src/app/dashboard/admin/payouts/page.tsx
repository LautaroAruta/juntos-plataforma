"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  DollarSign, 
  ArrowLeft, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Loader2,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AdminPayoutsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch providers with their total pending balance
    const { data: providersData } = await supabase
      .from('providers')
      .select(`
        id,
        nombre_empresa,
        nombre_contacto,
        logo_url,
        payments (
          id,
          monto_proveedor,
          estado_pago_proveedor
        )
      `);

    if (providersData) {
      const processedProviders = providersData.map(p => {
        const pending = p.payments?.filter((pay: any) => pay.estado_pago_proveedor === 'pendiente') || [];
        const totalPending = pending.reduce((acc: number, pay: any) => acc + Number(pay.monto_proveedor), 0);
        return { ...p, totalPending, pendingCount: pending.length };
      }).sort((a, b) => b.totalPending - a.totalPending);

      setProviders(processedProviders);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.rol !== "admin") {
      router.push("/dashboard");
    } else {
      fetchData();
    }
  }, [session, status, router, fetchData]);

  const viewPendingPayments = async (provider: any) => {
    setSelectedProvider(provider);
    const { data } = await supabase
      .from('payments')
      .select(`
        id,
        monto_total,
        monto_proveedor,
        creado_en,
        order:orders (id)
      `)
      .eq('estado_pago_proveedor', 'pendiente')
      .in('id', (await supabase.from('order_items').select('order_id').eq('provider_id', provider.id)).data?.map(i => i.order_id) || []); 
      
      // Note: The logic above is slightly flawed due to payment/provider relationship being via order items.
      // Re-fetching payments correctly based on the provider.
      
      const { data: providerPayments } = await supabase
        .from('payments')
        .select(`
            id,
            monto_total,
            monto_proveedor,
            creado_en,
            order:orders!inner (
                id,
                order_items!inner (provider_id)
            )
        `)
        .eq('estado_pago_proveedor', 'pendiente')
        .eq('orders.order_items.provider_id', provider.id);

    setPendingPayments(providerPayments || []);
  };

  const processPayout = async () => {
    if (!selectedProvider || pendingPayments.length === 0) return;
    
    setIsProcessing(true);
    const totalAmount = pendingPayments.reduce((acc, p) => acc + Number(p.monto_proveedor), 0);
    
    try {
      // 1. Create Payout record
      const { data: payout, error: payoutError } = await supabase
        .from('provider_payouts')
        .insert({
          provider_id: selectedProvider.id,
          monto_total: totalAmount,
          estado: 'completado',
          notas: `Liquidación de ${pendingPayments.length} órdenes.`
        })
        .select()
        .single();

      if (payoutError) throw payoutError;

      // 2. Update payments status
      const paymentIds = pendingPayments.map(p => p.id);
      const { error: updateError } = await supabase
        .from('payments')
        .update({ estado_pago_proveedor: 'liquidado' })
        .in('id', paymentIds);

      if (updateError) throw updateError;

      // 3. Log action
      await supabase.from('audit_logs').insert({
        user_id: session?.user?.id,
        accion: 'LIQUIDACION_PROVEEDOR',
        tabla: 'provider_payouts',
        registro_id: payout.id,
        valor_nuevo: { provider_id: selectedProvider.id, monto: totalAmount, payments: paymentIds }
      });

      toast.success(`Liquidación procesada por $${totalAmount.toLocaleString()}`);
      setSelectedProvider(null);
      fetchData();
    } catch (error: any) {
      toast.error("Error al procesar liquidación: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin" className="p-3 bg-white hover:bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Liquidaciones</h1>
            <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-1">Gestión de pagos a proveedores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Provider List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Buscar proveedor..."
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3] outline-none transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {providers
              .filter(p => p.nombre_empresa.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((provider) => (
              <motion.div
                key={provider.id}
                layoutId={provider.id}
                onClick={() => viewPendingPayments(provider)}
                className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${selectedProvider?.id === provider.id ? 'bg-[#009EE3] border-[#009EE3] shadow-lg shadow-[#009EE3]/20' : 'bg-white border-slate-100 hover:border-[#009EE3]/30 shadow-sm'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                      {provider.logo_url ? <img src={provider.logo_url} alt="" className="w-full h-full object-cover" /> : <DollarSign className="text-slate-300" />}
                    </div>
                    <div>
                      <h3 className={`font-black text-sm uppercase tracking-tight ${selectedProvider?.id === provider.id ? 'text-white' : 'text-slate-800'}`}>
                        {provider.nombre_empresa}
                      </h3>
                      <p className={`text-[10px] font-bold ${selectedProvider?.id === provider.id ? 'text-white/70' : 'text-slate-400'}`}>
                        {provider.pendingCount} órdenes pendientes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${selectedProvider?.id === provider.id ? 'text-white' : 'text-slate-900'}`}>
                      ${provider.totalPending.toLocaleString()}
                    </p>
                    <div className={`flex items-center justify-end gap-1 text-[8px] font-black uppercase tracking-widest ${selectedProvider?.id === provider.id ? 'text-white/60' : 'text-slate-400'}`}>
                      Saldo a Cobrar <ChevronRight size={10} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Detailed Pending Payments */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedProvider ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col"
              >
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-[#009EE3]">
                        <CheckCircle2 size={24} />
                     </div>
                     <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Desglose de Liquidación</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedProvider.nombre_empresa}</p>
                     </div>
                  </div>
                  <button 
                    onClick={processPayout}
                    disabled={isProcessing || pendingPayments.length === 0}
                    className="px-8 py-4 bg-[#00A650] hover:bg-[#008F45] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-[#00A650]/20 transition-all flex items-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <DollarSign size={16} />}
                    Liquidar ${selectedProvider.totalPending.toLocaleString()}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-50">
                        <th className="px-6 py-4">Orden</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Total Orden</th>
                        <th className="px-6 py-4 text-right">Neto Proveedor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pendingPayments.map((payment) => (
                        <tr key={payment.id} className="group">
                          <td className="px-6 py-5">
                            <span className="font-bold text-slate-700 text-xs">#{payment.order?.id.split('-')[0]}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {new Date(payment.creado_en).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-400">${payment.monto_total.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <span className="text-sm font-black text-[#00A650]">${payment.monto_proveedor.toLocaleString()}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {pendingPayments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <AlertCircle size={48} className="mb-4 opacity-20" />
                      <p className="font-black uppercase tracking-widest text-xs">No hay pagos pendientes</p>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-50 divide-y divide-white">
                  <div className="flex justify-between py-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total a transferir</span>
                    <span className="text-2xl font-black text-slate-900">${selectedProvider.totalPending.toLocaleString()}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium pt-4">
                    Al confirmar, se marcarán todos estos pagos como 'Liquidados' y el proveedor podrá verlo en su historial financiero.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-dashed border-slate-200 min-h-[600px] text-slate-400">
                 <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6">
                    <FileText size={32} className="opacity-30" />
                 </div>
                 <h2 className="text-lg font-black uppercase tracking-tight text-slate-300">Seleccioná un proveedor</h2>
                 <p className="text-xs font-medium">Para ver el detalle de sus pagos pendientes</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
