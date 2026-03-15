import React from "react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Timer, ChevronRight, ShoppingBag, MapPin } from "lucide-react";

export default async function ProductosPage() {
  const supabase = await createClient();

  // Fetch all active group deals
  const { data: deals } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .order('creado_en', { ascending: false });

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 mb-8 md:mb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#009EE3] tracking-widest mb-4">
                Ofertas Grupales Activas
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tighter uppercase mb-6">
                Comprá en grupo y <br className="hidden md:block" /> pagá mucho menos
              </h1>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                Unite a otros compradores para alcanzar el volumen mayorista y desbloquear el mejor precio del mercado.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#009EE3]" size={18} />
                <select className="bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-10 text-xs font-black uppercase tracking-widest text-slate-600 appearance-none focus:outline-none focus:ring-4 focus:ring-[#009EE3]/10 w-full sm:w-64 cursor-pointer">
                  <option>Mi Barrio: Todos</option>
                  <option>Caballito</option>
                  <option>Almagro</option>
                  <option>Villa Crespo</option>
                  <option>Palermo</option>
                </select>
              </div>
              <Link 
                href="/explorar/mapa"
                className="bg-white border-2 border-[#009EE3]/10 text-[#009EE3] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#009EE3]/5 transition-all shadow-sm"
              >
                 <MapPin size={18} /> Ver Mapa
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {deals && deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {deals.map((deal: any) => {
              const progress = (deal.participantes_actuales / deal.min_participantes) * 100;
              const percentageSaved = Math.round(
                ((deal.product.precio_individual - deal.precio_actual) / deal.product.precio_individual) * 100
              );

              return (
                <div 
                  key={deal.id}
                  className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 flex flex-col border border-gray-50 relative"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 border-b border-gray-50">
                    <img 
                      src={deal.product.imagen_principal || "/placeholder-product.jpg"} 
                      alt={deal.product.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {percentageSaved > 0 && (
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                        <span className="text-[#009EE3] font-black text-[10px] uppercase tracking-widest">{percentageSaved}% AHORRO</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 flex flex-col flex-1">
                    <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-2">{deal.product.categoria}</div>
                    <h3 className="text-gray-800 font-black text-lg leading-tight mb-4 group-hover:text-[#009EE3] transition-colors line-clamp-2">
                      {deal.product.nombre}
                    </h3>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-gray-300 text-sm font-bold line-through">
                        ${deal.product.precio_individual.toLocaleString()}
                      </p>
                      <p className="text-3xl font-black text-[#009EE3] tracking-tighter">
                        ${deal.precio_actual.toLocaleString()}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4 pt-6 border-t border-gray-50">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-[#009EE3]" />
                          {deal.participantes_actuales} de {deal.min_participantes} unidades
                        </span>
                        <div className="flex items-center gap-1.5 text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">
                          <Timer size={14} />
                          <span>2h 30min</span>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner flex">
                        <div 
                          className="h-full bg-gradient-to-r from-[#009EE3] to-[#00A650] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>

                      <Link 
                        href={`/productos/${deal.product.id}`}
                        className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-tight text-sm shadow-lg shadow-[#009EE3]/20 active:scale-95"
                      >
                        Ver oferta <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShoppingBag size={48} className="text-gray-200" />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-4 tracking-tighter uppercase">No hay ofertas grupales activas</h2>
            <p className="text-gray-500 font-medium mb-10">
              Estamos trabajando para traer las mejores oportunidades. ¡Volvé pronto!
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 bg-[#009EE3] hover:bg-[#00A650] text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all uppercase tracking-tight"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
