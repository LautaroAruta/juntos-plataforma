"use client";

import React, { useState, useTransition } from "react";
import { Filter, ArrowUpDown, ChevronDown, Check, X, Bell, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryToolbarProps {
  totalResults: number;
}

export default function CategoryToolbar({ totalResults }: CategoryToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const currentSort = searchParams.get("sort") || "newest";

  const sortOptions = [
    { id: "newest", label: "Más recientes" },
    { id: "price_asc", label: "Menor precio" },
    { id: "price_desc", label: "Mayor precio" },
    { id: "popular", label: "Más populares" },
  ];

  const handleSort = (sortId: string) => {
    setShowSort(false);
    startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("sort", sortId);
        router.push(`?${params.toString()}`);
    });
  };

  const applyPriceRange = (min?: number, max?: number) => {
    startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (min !== undefined) params.set("minPrice", min.toString());
        else params.delete("minPrice");
        if (max !== undefined) params.set("maxPrice", max.toString());
        else params.delete("maxPrice");
        router.push(`?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
        router.push("?"); 
    });
    setShowFilters(false);
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 relative z-30 transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}>
      <div className="text-sm font-bold text-gray-500 flex items-center gap-2">
        {isPending ? <Loader2 size={16} className="animate-spin text-[#009EE3]" /> : null}
        Mostrando <span className="text-gray-800">{totalResults} ofertas grupales</span>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Filtros Button */}
        <div className="relative">
          <button 
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 font-bold text-xs hover:border-[#009EE3] transition-all hover:bg-gray-50 active:scale-95"
          >
            <Filter size={16} /> Filtros
          </button>

          {/* Sidebar / Modal for Filters */}
          {showFilters && (
            <>
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" 
                onClick={() => setShowFilters(false)}
              />
              <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-[101] p-8 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Filtros</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-10">
                  {/* Price Filter */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rango de Precio</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 ml-1">Mínimo</span>
                        <input 
                          type="number" 
                          placeholder="$"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#009EE3]/10 focus:border-[#009EE3]"
                          onBlur={(e) => {
                            if (e.target.value) applyPriceRange(Number(e.target.value), undefined);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 ml-1">Máximo</span>
                        <input 
                          type="number" 
                          placeholder="$"
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-[#009EE3]/10 focus:border-[#009EE3]"
                          onBlur={(e) => {
                            if (e.target.value) applyPriceRange(undefined, Number(e.target.value));
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Filters */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgencia</label>
                    <button 
                      onClick={() => {
                        startTransition(() => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set("urgent", "true");
                            router.push(`?${params.toString()}`);
                        });
                        setShowFilters(false);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-[#FFF8E7] rounded-2xl border border-yellow-100 hover:border-yellow-300 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white">
                          <Bell size={20} className="animate-bounce" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Por finalizar</p>
                          <p className="text-[11px] font-medium text-slate-500 leading-none mt-1">Ofertas que cierran hoy</p>
                        </div>
                      </div>
                      <Check size={18} className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex gap-3 mt-auto">
                  <button 
                    onClick={clearFilters}
                    className="flex-1 py-4 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Limpiar todo
                  </button>
                  <button 
                    onClick={() => setShowFilters(false)}
                    className="flex-[2] py-4 bg-[#009EE3] text-white font-black rounded-2xl shadow-lg shadow-[#009EE3]/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase"
                  >
                    Ver resultados
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Ordenar Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowSort(!showSort)}
            className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-bold text-xs transition-all active:scale-95 ${
              showSort ? "border-[#009EE3] bg-[#E8F7FF] text-[#009EE3]" : "bg-white border-gray-200 text-gray-600 hover:border-[#009EE3]"
            }`}
          >
            <ArrowUpDown size={16} /> 
            <span>Ordenar por: {sortOptions.find(o => o.id === currentSort)?.label}</span>
            <ChevronDown size={14} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
          </button>

          {showSort && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowSort(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="py-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSort(option.id)}
                      className="w-full flex items-center justify-between px-5 py-3 text-left text-xs font-bold hover:bg-gray-50 transition-colors"
                    >
                      <span className={currentSort === option.id ? "text-[#009EE3]" : "text-gray-600"}>
                        {option.label}
                      </span>
                      {currentSort === option.id && <Check size={14} className="text-[#009EE3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
