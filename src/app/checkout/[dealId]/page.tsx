"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  CreditCard, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2,
  Loader2,
  MapPin,
  Store,
  Wallet
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
          product:products (
            *,
            provider:providers (nombre_empresa, telefono, direccion)
          )
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
      } else {
         alert("Error obteniendo URL de pago.");
         setCreatingPreference(false);
      }
    } catch (err) {
      alert("Error al procesar pago");
      setCreatingPreference(false);
    }
  };

  // -------------------------
  // LOADING SKELETON
  // -------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] pb-24 pt-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
           <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-8" />
           <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              <div className="lg:w-2/3 space-y-6">
                 <div className="h-64 bg-white rounded-3xl animate-pulse" />
                 <div className="h-64 bg-white rounded-3xl animate-pulse" />
              </div>
              <div className="lg:w-1/3">
                 <div className="h-96 bg-white rounded-3xl animate-pulse" />
              </div>
           </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // MAIN RENDER
  // -------------------------
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 md:pb-12 pt-4">
      {/* Top Header (Checkout specific) */}
      <div className="bg-[#FFF159] p-4 flex items-center justify-between border-b border-gray-200 hidden">
        {/* We can hide the global header for checkout if desired, 
            but since we are inside app/layout, we just render content here.
            Ideally, checkout has a clean layout. We simulate that by adding a brand bar. */}
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
        
        <Link 
          href={deal?.product ? `/productos/${deal.product.id}` : "/"}
          className="inline-flex items-center gap-2 text-[#009EE3] hover:text-[#00A650] font-bold text-sm mb-6 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver al producto
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          
          {/* COLUMNA IZQUIERDA: Opciones de Compra */}
          <div className="lg:w-2/3 space-y-6">
            
            <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight mb-2">
              ¿Cómo querés recibir tu compra?
            </h1>

            {/* SECCION: DOMICILIO / RETIRO */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#009EE3]" />
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center shrink-0">
                   <Store className="text-[#009EE3]" size={20} />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-black text-gray-800 mb-1">Retiro en domicilio del vendedor</h3>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                     Se coordina directamente una vez que se complete el grupo de compra.
                     <br />El proveedor es: <strong className="text-gray-700">{deal?.product?.provider?.nombre_empresa || "Proveedor verificado"}</strong>.
                   </p>
                   {/* Opciones (simuladas UI) */}
                   <div className="border border-[#009EE3] bg-[#FFF8E7]/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="text-[#009EE3]" size={20} />
                        <div>
                           <span className="block font-bold text-gray-800 text-sm">Gratis</span>
                           <span className="block text-xs text-gray-500">A coordinar post-compra</span>
                        </div>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            <h2 className="text-2xl mt-8 mb-2 md:text-3xl font-black text-gray-800 tracking-tight leading-tight">
              ¿Cómo querés pagar?
            </h2>

            {/* SECCION: PAGO */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
               <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-full bg-[#FFF8E7] flex items-center justify-center shrink-0">
                   <Wallet className="text-[#009EE3]" size={20} />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-black text-gray-800 mb-1">Mercado Pago</h3>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                     Podés pagar con tus tarjetas de débito, crédito o saldo en cuenta. Tu dinero está protegido.
                   </p>
                   
                   <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4 bg-gray-50 opacity-80 mb-3">
                      <div className="w-12 h-8 bg-blue-100 rounded flex items-center justify-center text-[10px] font-black text-blue-800 uppercase text-center leading-tight shrink-0">
                         Dinero<br/>en cuenta
                      </div>
                      <span className="text-sm font-bold text-gray-600">Dinero en tu cuenta de Mercado Pago</span>
                   </div>
                   
                   <div className="border border-gray-200 rounded-2xl p-4 flex items-center gap-4 bg-gray-50 opacity-80">
                      <div className="flex gap-1 shrink-0">
                        <div className="w-8 h-5 bg-blue-600 rounded" />
                        <div className="w-8 h-5 bg-orange-400 rounded" />
                      </div>
                      <span className="text-sm font-bold text-gray-600">Tarjetas de crédito o débito</span>
                   </div>

                 </div>
               </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Resumen */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
               <h3 className="text-lg font-black text-gray-800 mb-6 uppercase tracking-widest border-b border-gray-100 pb-4">
                 Resumen de compra
               </h3>
               
               <div className="flex gap-4 mb-6">
                 <div className="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden shrink-0">
                   <img src={deal?.product?.imagen_principal || "/placeholder.jpg"} className="w-full h-full object-cover" alt="Product image" />
                 </div>
                 <div>
                   <h4 className="font-bold text-sm text-gray-800 leading-snug line-clamp-2 mb-1">{deal?.product?.nombre}</h4>
                   <span className="text-[10px] font-black bg-[#FFF8E7] text-[#009EE3] px-2 py-0.5 rounded-md uppercase tracking-widest">
                     Oferta Grupal
                   </span>
                 </div>
               </div>

               <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Producto</span>
                    <span className="font-medium">${deal?.precio_actual?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Envío</span>
                    <span className="text-green-500 font-bold uppercase text-xs tracking-widest">Gratis</span>
                  </div>
               </div>

               <div className="flex justify-between items-end mb-8">
                  <span className="text-gray-800 font-bold">Pagás</span>
                  <span className="text-3xl font-black text-gray-800 tracking-tighter">
                    ${deal?.precio_actual?.toLocaleString() || 0}
                  </span>
               </div>

               <button
                  onClick={handlePayment}
                  disabled={creatingPreference}
                  className="w-full bg-[#009EE3] hover:bg-[#00A650] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl shadow-lg shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2 text-base group mb-6"
                >
                  {creatingPreference ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Confirmar Compra
                    </>
                  )}
               </button>

               {/* Trust y Seguridad integrados al resumen */}
               <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <ShieldCheck className="text-gray-400 shrink-0" size={20} />
                  <div className="text-xs text-gray-500 leading-relaxed font-medium">
                    <strong className="block text-gray-700 font-bold mb-0.5">Compra Protegida</strong>
                    Solo se debita el dinero si el grupo se completa con éxito.
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
