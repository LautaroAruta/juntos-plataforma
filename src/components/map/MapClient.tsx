"use client";

import dynamic from "next/dynamic";

const ProximityMap = dynamic(() => import("./ProximityMap"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 animate-pulse rounded-[3rem] flex items-center justify-center">
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Cargando Mapa Barrial...</p>
    </div>
  )
});

export default ProximityMap;
