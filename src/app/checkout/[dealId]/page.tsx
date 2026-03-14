"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const PickupMap = dynamic(() => import("@/components/shared/PickupMap"), {
  loading: () => <div className="h-[400px] w-full bg-slate-50 animate-pulse rounded-[2.5rem]" />,
  ssr: false,
});

import { 
  CreditCard, 
  ChevronLeft, 
  ShieldCheck, 
  CheckCircle2,
  Loader2,
  MapPin,
  Store,
  Wallet,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutPage() {
  const { dealId } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [pickupPoints, setPickupPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPreference, setCreatingPreference] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [useRewards, setUseRewards] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch deal
      const { data: dealData, error: dealError } = await supabase
        .from('group_deals')
        .select(`
          *,
          product:products (
            *,
            provider:providers (id, nombre_empresa, telefono, direccion)
          )
        `)
        .eq('id', dealId)
        .single();
      
      if (!dealError && dealData) {
        setDeal(dealData);
        
        // 2. Fetch pickup points for this provider
        const { data: pointsData } = await supabase
          .from('pickup_points')
          .select('*')
          .eq('provider_id', dealData.product.provider.id)
          .eq('active', true);
        
        if (pointsData) {
          setPickupPoints(pointsData);
          if (pointsData.length > 0) setSelectedPoint(pointsData[0]);
        }

        // 3. Fetch user wallet balance
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('wallet_balance')
            .eq('id', user.id)
            .single();
          if (userData) setWalletBalance(userData.wallet_balance || 0);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [dealId]);

  const handlePayment = async () => {
    if (!selectedPoint) {
      alert("Por favor seleccioná un punto de retiro.");
      return;
    }

    setCreatingPreference(true);
    try {
      const res = await fetch("/api/payments/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          dealId, 
          pickupPointId: selectedPoint.id,
          useRewards,
          rewardsAmount: useRewards ? Math.min(walletBalance, deal.precio_actual) : 0
        }),
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
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">
        
        <Link 
          href={deal?.product ? `/productos/${deal.product.id}` : "/"}
          className="inline-flex items-center gap-2 text-[#009EE3] hover:text-[#00A650] font-bold text-sm mb-6 transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver al producto
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          
          {/* COLUMNA IZQUIERDA: Opciones de Compra */}
          <div className="lg:w-2/3 space-y-12">
            
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight">
                ¿Dónde querés retirar tu compra?
              </h1>
              <p className="text-slate-500 font-medium">
                Seleccioná el punto de retiro más cercano o retiralo directamente del proveedor.
              </p>
            </div>

            {/* SECCION: LOGISTICA / PUNTOS DE RETIRO */}
            <div className="space-y-6">
              <PickupMap 
                points={pickupPoints} 
                selectedPointId={selectedPoint?.id}
                onSelectPoint={(point: any) => setSelectedPoint(point)}
                center={selectedPoint ? [selectedPoint.latitude, selectedPoint.longitude] : undefined}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-black text-gray-800 tracking-tight leading-tight">
                ¿Cómo querés pagar?
              </h2>
              <p className="text-slate-500 font-medium">Tus pagos están protegidos por Mercado Pago.</p>
            </div>

            {/* SECCION: PAGO */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 divide-y divide-slate-50">
               <div className="flex items-start gap-5 pb-8">
                 <div className="w-12 h-12 rounded-2xl bg-[#FFF8E7] flex items-center justify-center shrink-0">
                   <Wallet className="text-[#009EE3]" size={24} />
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-black text-gray-800 mb-1">Mercado Pago</h3>
                   <p className="text-sm text-gray-500 font-medium leading-relaxed">
                     Podés pagar con tus tarjetas de débito, crédito o saldo en cuenta.
                   </p>
                 </div>
               </div>

               <div className="pt-8 space-y-4">
                 <div className="border-2 border-slate-50 bg-slate-50/30 rounded-[2rem] p-5 flex items-center gap-4 group hover:border-[#00AEEF]/30 transition-all cursor-pointer">
                    <div className="w-14 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase text-center leading-tight shrink-0 group-hover:text-[#00AEEF]">
                       MERCADO<br/>PAGO
                    </div>
                    <div className="flex-1">
                      <span className="block text-sm font-black text-slate-800 uppercase tracking-tight">Todo en un solo lugar</span>
                      <span className="block text-xs text-slate-400 font-bold">Tarjeta, Débito o Efectivo</span>
                    </div>
                    <CheckCircle2 className="text-[#00AEEF]" size={24} />
                 </div>
               </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Resumen */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-[3rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-50 sticky top-24">
               <h3 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.2em] border-b border-slate-50 pb-6 flex items-center gap-2">
                 <ShoppingBag size={14} className="text-[#00AEEF]" /> Resumen de compra
               </h3>
               
               <div className="flex gap-5 mb-8">
                 <div className="w-20 h-20 rounded-[1.5rem] border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                   <img src={deal?.product?.imagen_principal || "/placeholder.jpg"} className="w-full h-full object-cover" />
                 </div>
                 <div>
                   <h4 className="font-black text-sm text-slate-800 leading-snug line-clamp-2 mb-2">{deal?.product?.nombre}</h4>
                   <span className="inline-flex text-[10px] font-black bg-[#FFF8E7] text-[#009EE3] px-3 py-1 rounded-full uppercase tracking-widest ring-1 ring-[#009EE3]/20">
                     OFERTA GRUPAL
                   </span>
                 </div>
               </div>

               <div className="space-y-4 text-sm border-b border-slate-50 pb-6 mb-8">
                  <div className="flex justify-between items-center text-slate-500 font-bold">
                    <span>Producto</span>
                    <span className="text-slate-800">${deal?.precio_actual?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 font-bold">
                    <span>Envío</span>
                    <span className="text-green-500 uppercase text-[10px] font-black tracking-widest bg-green-50 px-2 py-1 rounded-md">GRATIS</span>
                  </div>
               </div>

               {selectedPoint && (
                 <div className="bg-slate-50 rounded-2xl p-4 mb-4 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punto de Retiro Seleccionado</p>
                    <div className="flex gap-2">
                      <MapPin size={14} className="text-[#00AEEF] shrink-0 mt-0.5" />
                      <p className="text-xs font-black text-slate-700">{selectedPoint.name}</p>
                    </div>
                 </div>
               )}

               {walletBalance > 0 && (
                 <div className={`mb-8 p-5 rounded-3xl border-2 transition-all cursor-pointer ${useRewards ? 'border-[#00AEEF] bg-[#E8F7FF]' : 'border-slate-50 bg-slate-50/50'}`}
                      onClick={() => setUseRewards(!useRewards)}>
                    <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tus Recompensas</p>
                       <div className={`w-10 h-5 rounded-full relative transition-colors ${useRewards ? 'bg-[#00AEEF]' : 'bg-slate-200'}`}>
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${useRewards ? 'left-6' : 'left-1'}`} />
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-slate-800">Usar ${walletBalance.toLocaleString()}</span>
                       <span className="text-[10px] font-black text-[#00AEEF] uppercase bg-white px-2 py-0.5 rounded-full border border-[#00AEEF]/20">Dcto. Extra</span>
                    </div>
                 </div>
               )}

               <div className="flex justify-between items-end mb-10">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">Total a Pagar</span>
                  <div className="text-right">
                    {useRewards && (
                      <span className="block text-sm font-bold text-slate-300 line-through">
                        ${deal?.precio_actual?.toLocaleString() || 0}
                      </span>
                    )}
                    <span className="text-4xl font-black text-slate-800 tracking-tighter">
                      ${(deal?.precio_actual - (useRewards ? Math.min(walletBalance, deal.precio_actual) : 0)).toLocaleString() || 0}
                    </span>
                  </div>
               </div>

               <button
                  onClick={handlePayment}
                  disabled={creatingPreference || !selectedPoint}
                  className="w-full bg-[#009EE3] hover:bg-[#0077CC] disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-white font-black py-5 rounded-[2rem] shadow-xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest group mb-6 active:scale-[0.98]"
                >
                  {creatingPreference ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      Confirmar y pagar
                    </>
                  )}
               </button>

               <div className="flex items-start gap-4 bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50">
                  <ShieldCheck className="text-[#00AEEF] shrink-0" size={24} />
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">Compra Blindada</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                      Si el grupo no se completa en el tiempo límite, se te devuelve el dinero automáticamente.
                    </p>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
