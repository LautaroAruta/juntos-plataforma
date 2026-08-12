'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface NeighborhoodProduct {
  product_id: string;
  nombre: string;
  imagen_principal: string;
  order_count: number;
}

export default function NeighborhoodHighlights() {
  const [data, setData] = useState<{ neighborhood: string; products: NeighborhoodProduct[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/neighborhood/highlights')
      .then(res => res.json())
      .then(d => {
        if (d.products?.length > 0) {
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null; // Wait silently
  
  if (!data) {
    return (
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-white border-2 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-black flex items-center justify-center text-white border border-black shadow-[3px_3px_0px_0px_rgba(255,92,0,1)]">
              <MapPin size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-black uppercase tracking-tight mb-1">Elegí tu barrio</h3>
              <p className="text-black/50 text-sm font-medium">Sumate a tu zona para ver qué están comprando tus vecinos hoy.</p>
            </div>
          </div>
          <Link 
            href="/configuracion/perfil" 
            className="bg-black text-white font-black py-4 px-10 border border-black shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(255,92,0,1)] transition-all text-sm uppercase tracking-widest"
          >
            Configurar mi ubicación
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
      <div className="bg-white p-8 md:p-12 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <MapPin size={200} />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 relative z-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-white border border-black shadow-[3px_3px_0px_0px_rgba(255,92,0,1)]">
              <Sparkles className="animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tighter leading-none">
                Tendencia <br /> en <span className="text-[#FF5C00]">{data.neighborhood}</span>
              </h2>
            </div>
          </div>
          <Link href="/buscar" className="text-[10px] font-black text-black uppercase tracking-[0.2em] flex items-center gap-3 border-2 border-black px-6 py-2 hover:bg-[#FF5C00] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]">
            Ver más de mi zona <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative z-10">
          {data.products.map((product, i) => (
            <motion.div
              key={product.product_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/productos/${product.product_id}`} className="group flex flex-col gap-3">
                <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] border border-black">
                  <img 
                    src={product.imagen_principal} 
                    alt={product.nombre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white border border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                    <span className="text-[9px] font-black text-[#FF5C00] flex items-center gap-1 uppercase tracking-tighter">
                      <ShoppingBag size={12} strokeWidth={3} /> {product.order_count} Vecinos
                    </span>
                  </div>
                </div>
                <h4 className="text-xs font-black text-bandha-text uppercase tracking-tight truncate px-1 group-hover:text-bandha-primary transition-colors">
                  {product.nombre}
                </h4>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
