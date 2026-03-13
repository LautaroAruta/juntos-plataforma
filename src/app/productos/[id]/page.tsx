import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Timer, Info, Star, Share2, ShieldCheck, Truck, ChevronRight, Award } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import JoinDealButton from "@/components/group-deals/JoinDealButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  const session = await getServerSession(authOptions);

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tighter mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-8 font-medium">La oferta que buscás ya no está disponible o no existe.</p>
        <Link 
          href="/" 
          className="bg-[#009EE3] hover:bg-[#00A650] text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all uppercase tracking-tight"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const activeDeal = product.group_deals?.find((d: any) => d.estado === 'activo');
  const price = activeDeal ? activeDeal.precio_actual : product.precio_individual;
  const originalPrice = product.precio_individual;
  const discount = activeDeal ? Math.round((1 - price / originalPrice) * 100) : 0;
  const progress = activeDeal ? (activeDeal.participantes_actuales / activeDeal.min_participantes) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 md:pb-12 pt-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-[#009EE3] transition-colors">Volver al listado</Link>
          <ChevronRight size={14} />
          <Link href={`/buscar?categoria=${product.categoria}`} className="hover:text-[#009EE3] transition-colors">{product.categoria}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-600 truncate">{product.nombre}</span>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col lg:flex-row">
          
          {/* Columna Izquierda: Galería de Imágenes */}
          <div className="lg:w-3/5 relative bg-white border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
             {/* Main Image */}
             <div className="relative aspect-square md:aspect-[4/3] w-full flex items-center justify-center p-8 lg:p-12">
               <img 
                 src={product.imagen_principal || "/placeholder-product.jpg"} 
                 alt={product.nombre} 
                 className="max-h-full max-w-full object-contain"
               />
                {discount > 0 && (
                  <div className="absolute top-6 left-6 md:top-8 md:left-8 bg-[#009EE3] text-white font-black text-sm md:text-base px-4 py-2 rounded-2xl shadow-xl shadow-[#009EE3]/20 uppercase tracking-widest">
                    {discount}% AHORRO
                  </div>
                )}
             </div>
             
             {/* Thumbnail placeholders (if multiple images were supported) */}
             <div className="flex gap-4 p-6 overflow-x-auto justify-center md:justify-start border-t border-gray-50">
                <div className="w-16 h-16 rounded-xl border-2 border-[#009EE3] overflow-hidden p-1 opacity-100 cursor-pointer">
                  <img src={product.imagen_principal || "/placeholder-product.jpg"} className="w-full h-full object-cover rounded-lg" alt="thumb 1" />
                </div>
                {/* Add more thumbnails here in the future if product model adds array of images */}
             </div>
          </div>

          {/* Columna Derecha: Detalles y CTA */}
          <div className="lg:w-2/5 p-6 md:p-10 lg:p-12 flex flex-col">
            
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] md:text-xs font-black uppercase text-gray-400 tracking-widest">
                Nuevo | +100 vendidos
              </span>
              <div className="flex gap-3 text-gray-400">
                <button className="hover:text-[#009EE3] transition-colors active:scale-95"><Share2 size={20} /></button>
                <button className="hover:text-[#009EE3] transition-colors active:scale-95"><Star size={20} /></button>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-gray-800 leading-[1.1] tracking-tighter mb-2">
              {product.nombre}
            </h1>
            
            <p className="text-sm font-bold text-gray-400 mb-8 flex items-center gap-1.5 uppercase tracking-wide">
              Vendido por <span className="text-[#009EE3]">{product.provider?.nombre_empresa || "Proveedor Verificado"}</span>
              <Award size={14} className="text-[#009EE3]" />
            </p>

            {/* PRECIOS */}
            <div className="mb-8">
              {activeDeal && (
                <div className="text-sm md:text-base font-bold text-gray-400 line-through mb-1">
                  ${originalPrice.toLocaleString()} individual
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-4xl md:text-5xl font-black text-gray-800 tracking-tighter leading-none">
                  ${price.toLocaleString()}
                </span>
                {activeDeal && (
                  <span className="text-xs font-black text-white bg-[#009EE3] px-2 py-1 rounded-lg uppercase tracking-tight mt-1 shadow-sm">
                    Oferta Grupal
                  </span>
                )}
              </div>
              <p className="text-sm text-[#009EE3] font-bold mt-2 flex items-center gap-1">
                 <Truck size={16} /> Envío coordinado al completar
              </p>
            </div>

            {/* BARRA DE PROGRESO PREMIUM */}
            {activeDeal && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 relative overflow-hidden">
                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Users size={16} className="text-[#009EE3]" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quórum actual</div>
                      <div className="text-sm font-black text-gray-800">
                        {activeDeal.participantes_actuales} de {activeDeal.min_participantes} unidos
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Termina en</div>
                    <div className="flex items-center gap-1 text-red-500 font-black text-sm bg-red-50 px-2 py-1 rounded-lg">
                      <Timer size={14} /> 23h 59m
                    </div>
                  </div>
                </div>
                
                <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden shadow-inner relative z-10">
                   <div 
                      className="h-full bg-gradient-to-r from-[#009EE3] to-[#00A650] rounded-full transition-all duration-1000 relative"
                      style={{ width: `${Math.min(100, progress)}%` }}
                    >
                      {/* Brillo en la barra */}
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-full" />
                    </div>
                </div>
                {activeDeal.participantes_actuales === 0 && (
                   <p className="text-xs font-bold text-gray-500 mt-4 relative z-10">¡Sé el primero en unirte y asegura este precio!</p>
                )}
              </div>
            )}

            {/* BOTONES DE ACCION (Desktop) */}
            <div className="hidden md:flex flex-col gap-3 mb-10 w-full mt-auto">
              <div className="flex gap-3">
                 <button className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center leading-none border border-gray-200">
                   <span className="text-[10px] uppercase tracking-widest mb-1">Comprar Seguro</span>
                   <span className="text-base">${originalPrice.toLocaleString()}</span>
                 </button>
                 
                 {activeDeal && (
                   <div className="flex-[2]">
                     <JoinDealButton dealId={activeDeal.id} />
                   </div>
                 )}
              </div>
              <p className="text-[10px] font-bold text-center text-gray-400 uppercase tracking-widest">
                No se cobrará nada si el grupo no se completa.
              </p>
            </div>

            {/* TRUST BADGES */}
            <div className="space-y-4 pt-8 border-t border-gray-100 text-sm font-medium text-gray-500">
              <div className="flex items-start gap-4">
                <ShieldCheck size={24} className="text-gray-300 shrink-0" />
                <div>
                  <span className="text-gray-800 font-bold block mb-0.5">Compra Protegida</span>
                  Recibí el producto que esperabas o te devolvemos tu dinero.
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award size={24} className="text-gray-300 shrink-0" />
                <div>
                  <span className="text-gray-800 font-bold block mb-0.5">Garantía BANDHA</span>
                  Todo proveedor pasa por un riguroso proceso de validación.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DESCRIPCION EXTENDIDA */}
        <div className="mt-8 bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-sm border border-gray-100">
           <h2 className="text-2xl font-black text-gray-800 tracking-tighter uppercase mb-8 flex items-center gap-3">
             <Info className="text-[#009EE3]" size={28} />
             Descripción del producto
           </h2>
           <div className="prose prose-slate max-w-3xl text-gray-600 font-medium leading-relaxed whitespace-pre-line text-sm md:text-base">
             {product.descripcion}
           </div>
        </div>

      </div>

      {/* FIXED ACTION BAR (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 pb-8 border-t border-gray-100 flex items-center gap-3 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.05)]">
        <button className="flex-1 max-w-[120px] h-14 bg-gray-100 text-gray-600 font-black rounded-xl active:scale-95 flex flex-col items-center justify-center leading-none border border-gray-200">
           <span className="text-[9px] uppercase tracking-widest mb-1">Seguro</span>
           <span className="text-sm">${originalPrice.toLocaleString()}</span>
        </button>
        {activeDeal && (
           <div className="flex-[2] h-14 relative group">
             {/* Necesitamos ajustar el JoinDealButton o crear uno custom para mobile que encaje en el layout fijo */}
             <JoinDealButton dealId={activeDeal.id} />
           </div>
        )}
      </div>
    </div>
  );
}
