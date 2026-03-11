import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Timer, Info, Star, Share2, ShieldCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import JoinDealButton from "@/components/group-deals/JoinDealButton";

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  // Fetch product and its active deal
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      *,
      provider:providers (nombre_empresa),
      group_deals (*)
    `)
    .eq('id', id)
    .single();

  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800">Producto no encontrado</h1>
        <Link href="/" className="text-[#00AEEF] mt-4 inline-block font-bold">Volver al inicio</Link>
      </div>
    );
  }

  const activeDeal = product.group_deals?.find((d: any) => d.estado === 'activo');
  const discount = Math.round(((product.precio_individual - (activeDeal?.precio_actual || product.precio_grupal_minimo)) / product.precio_individual) * 100);

  return (
    <div className="pb-32 min-h-screen bg-slate-50">
      {/* Top Header/Nav */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"><Share2 size={20} /></button>
          <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600"><Star size={20} /></button>
        </div>
      </div>

      {/* Hero Image Carousel (Single for now) */}
      <div className="bg-white aspect-square relative overflow-hidden">
        <img 
          src={product.imagen_principal} 
          alt={product.nombre} 
          className="w-full h-full object-cover"
        />
        {discount > 0 && (
          <div className="absolute top-6 left-6 bg-red-500 text-white font-black px-4 py-2 rounded-2xl shadow-xl shadow-red-500/20 transform -rotate-3 uppercase tracking-tighter">
            AHORRÁ {discount}%
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase text-[#0077CC] tracking-widest bg-[#E8F7FF] px-2 py-0.5 rounded-full">
                {product.categoria}
              </span>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-0.5 rounded-full">
                Vendido por {product.provider?.nombre_empresa}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 leading-tight tracking-tighter uppercase">{product.nombre}</h1>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-400 line-through decoration-red-500/50 decoration-2">${product.precio_individual.toLocaleString()}</span>
              <span className="text-4xl font-black text-[#00AEEF] tracking-tighter -mt-1">
                ${(activeDeal?.precio_actual || product.precio_grupal_minimo).toLocaleString()}
              </span>
            </div>
            <div className="mb-1 text-xs font-bold text-[#0077CC] bg-[#E8F7FF] px-3 py-1 rounded-xl">PRECIO GRUPAL</div>
          </div>

          {activeDeal && (
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 border border-slate-100 shadow-inner">
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2 text-slate-700 font-extrabold text-sm uppercase tracking-tighter">
                  <Users size={18} className="text-[#00AEEF]" />
                  <span>Faltan {activeDeal.min_participantes - activeDeal.participantes_actuales} personas</span>
                </div>
                <div className="flex items-center gap-2 text-red-500 font-black text-sm px-3 py-1 bg-red-50 rounded-xl">
                  <Timer size={16} />
                  <span className="tracking-widest">23:59:00</span>
                </div>
              </div>
              
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
                 <div 
                    className="h-full bg-gradient-to-r from-[#00AEEF] to-[#0077CC] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (activeDeal.participantes_actuales / activeDeal.min_participantes) * 100)}%` }}
                  />
              </div>
              <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase text-center tracking-widest">Ahorro garantizado al completar el grupo</p>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Info size={18} className="text-[#00AEEF]" /> Descripción
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
              {product.descripcion}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-6">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Truck size={24} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Envío</span>
                <span className="text-xs font-bold text-slate-700">Retiro en local</span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck size={24} className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Garantía</span>
                <span className="text-xs font-bold text-slate-700">Compra protegida</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Selection (Fixed Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-6 border-t border-slate-100 flex items-center gap-4 max-w-screen-md mx-auto z-50 rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
        <button className="h-16 px-6 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black rounded-2xl transition-all active:scale-95 flex flex-col items-center justify-center leading-none">
          <span className="text-[10px] uppercase opacity-70 mb-1">Individual</span>
          <span className="text-lg">${product.precio_individual.toLocaleString()}</span>
        </button>
        
        {activeDeal && <JoinDealButton dealId={activeDeal.id} />}
      </div>
    </div>
  );
}
