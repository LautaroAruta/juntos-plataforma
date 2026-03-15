"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SmartRecommendations() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRecommendations() {
      // Logic: For now, fetch high-discount active deals or high-stock products
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(4)
        .order('precio_individual', { ascending: false }); // Mocking "premium" recommendations
      
      if (data) setProducts(data);
      setLoading(false);
    }
    fetchRecommendations();
  }, []);

  if (loading || products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="bg-gradient-to-br from-[#009EE3] to-[#00A650] rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-[#009EE3]/20">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Recomendados para vos</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link 
                key={product.id}
                href={`/productos/${product.id}`}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 hover:bg-white/20 transition-all group"
              >
                <div className="aspect-square rounded-2xl bg-white mb-4 overflow-hidden p-2">
                  <img 
                    src={product.imagen_principal || "/placeholder.jpg"} 
                    alt={product.nombre}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                  />
                </div>
                <h4 className="font-bold text-white text-sm mb-1 truncate">{product.nombre}</h4>
                <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Ahorro Grupal</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-white">${product.precio_grupal_minimo?.toLocaleString()}</span>
                  <div className="w-8 h-8 rounded-full bg-white text-[#009EE3] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Decorative Penguin background */}
        <div className="absolute right-[-5%] bottom-[-10%] opacity-10 pointer-events-none">
          <ShoppingBag size={300} />
        </div>
      </div>
    </section>
  );
}
