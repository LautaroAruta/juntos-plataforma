import React from "react";
import Link from "next/link";
import { 
  Users, 
  Timer, 
  ChevronRight, 
  ShoppingBag, 
  Truck, 
  Gamepad2,
  Shirt,
  Apple,
  Home as HomeIcon,
  Dumbbell,
  Sparkles,
  Puzzle,
  MoreHorizontal,
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CountdownTimer from "@/components/shared/CountdownTimer";
import HeroCarousel from "@/components/home/HeroCarousel";

import ProductCard from "@/components/home/ProductCard";
import BenefitsBar from "@/components/home/BenefitsBar";
import { CATEGORIES } from "@/lib/constants/categories";

import SocialTicker from "@/components/home/SocialTicker";
import NeighborhoodHighlights from "@/components/home/NeighborhoodHighlights";
import HomeReferralBanner from "@/components/home/HomeReferralBanner";
import * as LucideIcons from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch active group deals
  const { data: allDeals } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .gt('fecha_vencimiento', new Date().toISOString())
    .order('creado_en', { ascending: false });

  // Filtrar ofertas que no tengan producto asociado (evitar crashes)
  const validDeals = (allDeals || []).filter((d: any) => d.product !== null);

  // Logic for Hero Carousel: Sort by "least missing people"
  const dealsForCarousel = validDeals
    ? [...validDeals]
        .sort((a, b) => (a.min_participantes - a.participantes_actuales) - (b.min_participantes - b.participantes_actuales))
        .slice(0, 5)
    : [];

  const flashSaleDeal = dealsForCarousel[0];

  // Deals for the grid
  const deals = validDeals?.slice(0, 8) || [];

  // Fetch individual products (featured)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(8)
    .order('creado_en', { ascending: false });


  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20">
      
      {/* SECCIÓN 1 — Banner hero */}
      <section className="relative w-full overflow-hidden bg-white px-4 sm:px-6 md:px-0">
        <div className="max-w-7xl mx-auto md:mt-16 mb-16">
          <div className="relative w-full rounded-none md:rounded-[3rem] overflow-hidden bg-white flex flex-col md:flex-row items-center border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] py-12 md:py-24">
            
            <div className="relative z-10 px-8 md:px-20 max-w-3xl flex flex-col justify-center">
              <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-6">Bandha Deals</span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-black mb-6 leading-[0.9] tracking-tighter">
                Comprá en grupo y pagá menos.
              </h1>
              <p className="text-gray-500 text-lg md:text-2xl mb-10 font-medium">
                Cuantos más somos, más ahorramos.
              </p>
              <Link 
                href="/productos"
                className="inline-flex items-center gap-3 bg-black text-white font-bold py-5 px-12 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:bg-gray-900 transition-all text-sm md:text-lg tracking-tight group self-start"
              >
                Ver ofertas grupales
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Visual element (Carousel of deals about to close) */}
            <div className="hidden lg:flex absolute right-10 xl:right-20 top-1/2 -translate-y-1/2 w-[380px] xl:w-[420px] items-center justify-center">
               <HeroCarousel deals={dealsForCarousel} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1.2 — Beneficios y Medios de Pago */}
      <BenefitsBar />
      <SocialTicker />

      {/* SECCIÓN 2 — Categorías destacadas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-bandha-text uppercase tracking-tight flex items-center gap-2">
            Categorías
          </h2>
        </div>
        
        {/* Horizontal scroll on mobile with padding to avoid clipping on hover scale */}
        <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-4 overflow-x-auto p-6 md:p-8 -m-6 md:-m-8 hide-scrollbar no-scrollbar">
          {CATEGORIES.map((cat, i) => {
            const Icon = (LucideIcons as any)[cat.iconName];
            return (
              <Link 
                key={i} 
                href={`/categoria/${cat.slug}`}
                className={`group cursor-pointer flex flex-col items-center gap-4 p-5 rounded-[2.5rem] border border-white/50 shadow-sm transition-all min-w-[120px] sm:min-w-0
                  bg-white/40 backdrop-blur-md 
                  hover:scale-110 hover:shadow-xl hover:bg-white/80
                  ${cat.id === 'tecnologia' ? 'hover:shadow-blue-500/20' : ''}
                  ${cat.id === 'moda' ? 'hover:shadow-pink-500/20' : ''}
                  ${cat.id === 'hogar' ? 'hover:shadow-orange-500/20' : ''}
                  ${cat.id === 'alimentos' ? 'hover:shadow-green-500/20' : ''}
                  ${cat.id === 'deportes' ? 'hover:shadow-red-500/20' : ''}
                  ${cat.id === 'belleza' ? 'hover:shadow-purple-500/20' : ''}
                  ${cat.id === 'juguetes' ? 'hover:shadow-yellow-500/20' : ''}
                  ${cat.id === 'herramientas' ? 'hover:shadow-slate-500/20' : ''}
                `}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-inner
                  ${cat.color.replace('text-', 'bg-')}/15 ${cat.color}
                `}>
                  {Icon && <Icon size={28} strokeWidth={2.5} />}
                </div>
                <span className="label-badge text-bandha-text-secondary group-hover:text-bandha-text transition-colors text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>



      {/* SECCIÓN 3 — Ofertas grupales activas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-bandha-primary/10 rounded-2xl flex items-center justify-center text-bandha-primary">
              <Timer className="animate-pulse" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-bandha-text uppercase tracking-tighter">Ofertas grupales activas</h2>
          </div>
          <Link href="/productos" className="group text-sm text-bandha-primary font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
            Ver todas <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {!deals || deals.length === 0 ? (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pronto habrá nuevas ofertas grupales...</p>
            </div>
          ) : deals.map((deal: any) => (
            <ProductCard key={deal.id} deal={deal} />
          ))}
        </div>
      </section>

      {/* Neighborhood Highlights */}
      <NeighborhoodHighlights />

      {/* SECCIÓN 4 — Productos destacados */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-black text-bandha-text uppercase tracking-tighter mb-10">Más productos destacados</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {featuredProducts?.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* How it works Banner */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-bandha-surface rounded-[4rem] p-12 md:p-24 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-12">
            <h2 className="text-4xl md:text-6xl font-black text-black leading-[0.9] tracking-tighter">¿Cómo funciona BANDHA?</h2>
            <div className="grid grid-cols-1 gap-10">
              {[
                { step: "1", title: "Elegí tu oferta", text: "Buscá el producto que necesitás entre cientos de ofertas grupales activas." },
                { step: "2", title: "Unite al grupo", text: "Sumate a otros compradores para llegar al precio mayorista." },
                { step: "3", title: "Recibilo en casa", text: "Una vez que el grupo se completa, el proveedor envía tu pedido directamente a tu puerta." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-black font-black text-lg">{item.step}</div>
                  <div>
                    <h5 className="font-extrabold text-black text-xl mb-1 tracking-tight">{item.title}</h5>
                    <p className="text-gray-500 text-base leading-relaxed max-w-sm">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-md bg-white rounded-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-50 flex items-center justify-center overflow-hidden">
               <Truck size={140} className="text-black opacity-10 transform -rotate-12" />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 mb-20 relative z-20">
        <HomeReferralBanner />
      </div>

    </div>
  );
}
