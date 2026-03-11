import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Users, Timer, ChevronRight, Zap, ShoppingCart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session?.user?.id === 'admin' || session?.user?.rol === 'admin') {
    redirect('/admin/dashboard');
  }

  const supabase = await createClient();
  
  // Fetch active group deals with their products
  const { data: deals, error } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .order('creado_en', { ascending: false });

  if (error) {
    console.error("Error fetching deals:", error);
  }

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#00AEEF] to-[#0077CC] text-white p-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Zap size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-2 leading-tight tracking-tighter uppercase">Comprá en grupo,<br/>pagá menos.</h1>
          <p className="text-white/90 text-sm mb-6 max-w-[280px] font-medium leading-relaxed">
            Unite a ofertas grupales y conseguí precios de fábrica. Mientras más somos, más ahorramos.
          </p>
          <div className="flex gap-3">
            <button className="bg-white text-[#0077CC] font-black py-3 px-8 rounded-2xl shadow-xl text-sm hover:scale-105 active:scale-95 transition-all">
              Ver Ofertas
            </button>
          </div>
        </div>
      </section>

      {/* Categories Bar (Simple Icons) */}
      <section className="px-4 mt-8 flex justify-between">
        {['🍎', '🎧', '🏠', '👗'].map((emoji, i) => (
          <div key={i} className="w-16 h-16 rounded-2xl bg-white border border-slate-50 shadow-sm flex items-center justify-center text-2xl hover:bg-[#E8F7FF] transition-colors cursor-pointer">
            {emoji}
          </div>
        ))}
      </section>

      {/* Group Deals Section */}
      <section className="px-4 mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight uppercase">
            <Timer className="text-red-500 animate-pulse" size={24} />
            Terminan pronto
          </h2>
          <Link href="/catalogo" className="text-xs text-[#00AEEF] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
            Ver todas <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid gap-6">
          {!deals || deals.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 italic text-slate-400">
              Pronto habrá nuevas ofertas...
            </div>
          ) : deals.map((deal: any) => {
            const progress = (deal.participantes_actuales / deal.min_participantes) * 100;
            const percentageSaved = Math.round(
              ((deal.product.precio_individual - deal.precio_actual) / deal.product.precio_individual) * 100
            );

            return (
              <Link href={`/products/${deal.product.id}`} key={deal.id}>
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-50 p-5 flex gap-5 relative overflow-hidden group hover:border-[#00AEEF]/30 transition-all">
                  {/* Discount Badge */}
                  <div className="absolute top-0 left-0 bg-[#00AEEF] text-white text-xs font-black px-4 py-1.5 rounded-br-2xl z-10 shadow-lg">
                    AHORRÁ {percentageSaved}%
                  </div>

                  {/* Product Image */}
                  <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden bg-slate-100 relative shadow-inner">
                    <img 
                      src={deal.product.imagen_principal} 
                      alt={deal.product.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {/* Deal Info */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base leading-tight line-clamp-2 mb-2 group-hover:text-[#0077CC] transition-colors">
                        {deal.product.nombre}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#00AEEF] tracking-tighter">${deal.precio_actual.toLocaleString()}</span>
                        <span className="text-sm text-slate-400 line-through decoration-red-500/50 decoration-2">${deal.product.precio_individual.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progress info */}
                    <div className="mt-4">
                      <div className="flex justify-between items-end mb-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600 font-black uppercase tracking-tighter">
                          <Users size={14} className="text-[#0077CC]" />
                          <span> {deal.min_participantes - deal.participantes_actuales} faltantes</span>
                        </div>
                        <span className="text-red-500 font-black tracking-widest px-2 py-0.5 bg-red-50 rounded-lg">23:59:00</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00AEEF] to-[#0077CC] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 p-4 flex justify-around items-center max-w-screen-md mx-auto z-50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <Link href="/" className="flex flex-col items-center p-2 text-[#00AEEF]">
          <span className="text-2xl">🏠</span>
          <span className="text-[10px] font-black uppercase mt-1">Inicio</span>
        </Link>
        <button className="flex flex-col items-center p-2 text-slate-400 hover:text-[#00AEEF] transition-colors">
          <span className="text-2xl">🔍</span>
          <span className="text-[10px] font-bold uppercase mt-1">Buscar</span>
        </button>
        <button className="flex flex-col items-center p-2 text-slate-400 relative hover:text-[#00AEEF] transition-colors">
          <span className="text-2xl text-slate-600 font-bold tracking-tighter">🎁</span>
          <span className="text-[10px] font-bold uppercase mt-1">Ofertas</span>
          <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <Link href="/auth/login" className="flex flex-col items-center p-2 text-slate-400 hover:text-[#00AEEF] transition-colors">
          <span className="text-2xl">👤</span>
          <span className="text-[10px] font-bold uppercase mt-1">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}
