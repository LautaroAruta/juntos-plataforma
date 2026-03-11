"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CreditCard, 
  ChevronLeft, 
  ShieldCheck, 
  ShoppingCart,
  CheckCircle2,
  Loader2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const { dealId } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPreference, setCreatingPreference] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchDeal() {
      const { data, error } = await supabase
        .from('group_deals')
        .select(`
          *,
          product:products (*)
        `)
        .eq('id', dealId)
        .single();
      
      if (!error) setDeal(data);
      setLoading(false);
    }
    fetchDeal();
  }, [dealId]);

  const handlePayment = async () => {
    setCreatingPreference(true);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = await res.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (err) {
      alert("Error al procesar pago");
      setCreatingPreference(false);
    }
  };

  if (loading) return <div className="p-20 text-center uppercase font-black text-slate-300">Cargando Pedido...</div>;

  return (
    <div className="pb-32 px-4 max-w-lg mx-auto">
       <Link 
          href={`/products/${deal?.product?.id}`}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold my-8 transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al Producto
        </Link>

        <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">Finalizar Compra</h1>
        <p className="text-slate-500 mb-8 font-medium">Revisá tu pedido antes de pagar.</p>

        <div className="space-y-6">
          {/* Order Summary Card */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-[#00AEEF]/5 border border-slate-50">
            <div className="flex gap-4 mb-6 pb-6 border-b border-slate-50">
               <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={deal.product.imagen_principal} className="w-full h-full object-cover" />
               </div>
               <div>
                 <h3 className="font-black text-slate-800 text-sm leading-tight uppercase line-clamp-2">{deal.product.nombre}</h3>
                 <span className="text-xs font-bold text-[#00AEEF] bg-[#E8F7FF] px-2 py-0.5 rounded-lg mt-1 inline-block">PRECIO GRUPAL</span>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                <span className="font-bold text-slate-700">${deal.precio_actual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Envío (Retiro)</span>
                <span className="font-bold text-green-500 uppercase text-[10px] tracking-widest">Gratis</span>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-slate-800 font-black uppercase text-sm tracking-tighter">Total a pagar</span>
                <span className="text-3xl font-black text-[#00AEEF] tracking-tighter">${deal.precio_actual.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
            <ShieldCheck className="text-blue-500 mt-1" size={24} />
            <div className="text-xs leading-relaxed">
              <span className="block font-black text-blue-800 uppercase mb-1 tracking-widest">Compra Protegida</span>
               Tu pago está asegurado. Si el grupo no se completa en el tiempo estipulado, se te devolverá el 100% de tu dinero de forma automática.
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={creatingPreference}
            className="w-full bg-[#0077CC] hover:bg-[#00AEEF] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#0077CC]/20 transition-all flex items-center justify-center gap-3 text-lg group"
          >
            {creatingPreference ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                <CreditCard size={24} className="group-hover:scale-110 transition-transform" /> 
                PAGAR CON MERCADO PAGO
              </>
            )}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-slate-300">
             <div className="h-px bg-slate-100 flex-1"></div>
             <span className="text-[10px] uppercase font-black tracking-widest px-2">Secure Payment</span>
             <div className="h-px bg-slate-100 flex-1"></div>
          </div>
        </div>
    </div>
  );
}
