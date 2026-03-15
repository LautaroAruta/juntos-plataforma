import React from "react";
import { createClient } from "@/lib/supabase/server";
import { MapPin, Search, Filter, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ProximityMap from "@/components/map/MapClient";

export default async function MapaExploracion() {
  const supabase = await createClient();

  // Fetch verified hubs and provider sites
  const { data: hubs } = await supabase
    .from('pickup_points')
    .select('*')
    .eq('active', true);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col h-[100vh]">
      {/* Header compact for Map view */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 h-24 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/productos" className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Mapa de Cercanía</h1>
              <p className="text-[10px] font-bold text-[#00AEEF] uppercase tracking-widest">Encontrá ofertas en tu barrio</p>
            </div>
          </div>

          <div className="hidden md:flex gap-3">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscá por calle o barrio..."
                  className="bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#00AEEF]/10 w-64"
                />
             </div>
             <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#00AEEF] transition-all">
                <Filter size={18} />
             </button>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 p-4 md:p-8 relative">
        <div className="w-full h-full">
           <ProximityMap hubs={hubs || []} />
        </div>

        {/* Floating Overlay Widgets */}
        <div className="absolute bottom-12 left-12 right-12 md:left-auto md:w-80 space-y-4">
           <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
                 <MapPin className="text-[#00AEEF]" size={16} /> Estás en Caballito
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                 Hay **15 ofertas grupales** activas a menos de 10 cuadras de tu ubicación.
              </p>
              <button className="w-full bg-[#009EE3] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#009EE3]/20">
                 Ver Ofertas Cercanas
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
