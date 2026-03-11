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

export default async function Home() {
  const supabase = await createClient();
  
  // Fetch active group deals
  const { data: deals } = await supabase
    .from('group_deals')
    .select(`
      *,
      product:products (*)
    `)
    .eq('estado', 'activo')
    .limit(8)
    .order('creado_en', { ascending: false });

  // Fetch individual products (featured)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(8)
    .order('creado_en', { ascending: false });

  const categories = [
    { name: "Electrónica", icon: <Gamepad2 size={24} />, color: "text-blue-500" },
    { name: "Ropa", icon: <Shirt size={24} />, color: "text-pink-500" },
    { name: "Alimentos", icon: <Apple size={24} />, color: "text-green-500" },
    { name: "Hogar", icon: <HomeIcon size={24} />, color: "text-orange-500" },
    { name: "Deportes", icon: <Dumbbell size={24} />, color: "text-red-500" },
    { name: "Belleza", icon: <Sparkles size={24} />, color: "text-purple-500" },
    { name: "Juguetes", icon: <Puzzle size={24} />, color: "text-yellow-500" },
    { name: "Otros", icon: <MoreHorizontal size={24} />, color: "text-gray-500" },
  ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-20">
      
      {/* SECCIÓN 1 — Banner hero */}
      <section className="relative w-full overflow-hidden bg-white md:bg-transparent px-4 sm:px-6 md:px-0">
        <div className="max-w-7xl mx-auto md:mt-8">
          <div className="relative w-full h-[300px] md:h-[450px] rounded-none md:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#00AEEF] to-[#0077CC] flex items-center shadow-2xl shadow-[#00AEEF]/20">
            {/* Background pattern/elements */}
            <div className="absolute inset-0 overflow-hidden opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8F7FF] rounded-full -ml-32 -mb-32 blur-2xl"></div>
            </div>

            <div className="relative z-10 px-8 md:px-20 max-w-2xl">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tighter">
                Comprá en grupo y pagá menos
              </h1>
              <p className="text-white/90 text-lg md:text-2xl mb-8 font-medium">
                Cuantos más somos, más ahorramos
              </p>
              <Link 
                href="/productos"
                className="inline-flex items-center gap-3 bg-white text-[#0077CC] font-black py-4 px-10 rounded-2xl shadow-xl hover:bg-gray-50 transition-all text-sm md:text-lg uppercase tracking-tight group"
              >
                Ver ofertas grupales
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Visual element (placeholder for product image) */}
            <div className="hidden lg:block absolute right-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/10 rounded-[4rem] backdrop-blur-sm border border-white/20 transform rotate-6">
               <div className="absolute inset-4 bg-white/20 rounded-[3rem] border border-white/30 flex items-center justify-center -rotate-3 overflow-hidden">
                  <div className="animate-pulse flex flex-col items-center">
                    <ShoppingBag size={80} className="text-white opacity-50 mb-4" />
                    <div className="h-4 w-32 bg-white/20 rounded-full"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2 — Categorías destacadas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
            Categorías
          </h2>
        </div>
        
        {/* Horizontal scroll on mobile */}
        <div className="flex sm:grid sm:grid-cols-4 md:grid-cols-8 gap-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar no-scrollbar">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              className="group cursor-pointer flex flex-col items-center gap-4 p-5 bg-white rounded-3xl border border-transparent shadow-sm hover:shadow-xl hover:shadow-[#00AEEF]/5 transition-all min-w-[120px] sm:min-w-0"
            >
              <div className={`w-12 h-12 flex items-center justify-center transform group-hover:scale-110 transition-transform ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest text-center group-hover:text-gray-800 transition-colors">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 3 — Ofertas grupales activas */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00AEEF]/10 rounded-2xl flex items-center justify-center text-[#00AEEF]">
              <Timer className="animate-pulse" size={24} />
            </div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter">Ofertas grupales activas</h2>
          </div>
          <Link href="/productos" className="group text-sm text-[#00AEEF] font-black uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform">
            Ver todas <ChevronRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {!deals || deals.length === 0 ? (
            <div className="col-span-full bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pronto habrá nuevas ofertas grupales...</p>
            </div>
          ) : deals.map((deal: any) => {
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
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[#00AEEF] font-black text-[10px] uppercase tracking-widest">{percentageSaved}% AHORRO</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-gray-800 font-black text-lg leading-tight mb-4 group-hover:text-[#00AEEF] transition-colors line-clamp-2">
                    {deal.product.nombre}
                  </h3>
                  
                  <div className="space-y-1 mb-6">
                    <p className="text-gray-300 text-sm font-bold line-through">
                      ${deal.product.precio_individual.toLocaleString()}
                    </p>
                    <p className="text-3xl font-black text-[#00AEEF] tracking-tighter">
                      ${deal.precio_actual.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-50 space-y-6">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                        <span>{deal.participantes_actuales} de {deal.min_participantes} unidos</span>
                        <span className="text-red-500 flex items-center gap-1"><Timer size={12} /> 2h 30min</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#00AEEF] to-[#0077CC] rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                    </div>

                    <Link 
                      href={`/productos/${deal.product.id}`}
                      className="w-full bg-gray-50 hover:bg-[#00AEEF] text-gray-800 hover:text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center text-sm uppercase tracking-tight group"
                    >
                      Ver oferta
                      <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECCIÓN 4 — Productos destacados */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <h2 className="text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter mb-10">Más productos destacados</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts?.map((product: any) => (
            <Link 
              href={`/productos/${product.id}`}
              key={product.id}
              className="bg-white rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-gray-200 transition-all border border-gray-50 group"
            >
              <div className="aspect-square bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                <img 
                  src={product.imagen_principal || "/placeholder-product.jpg"} 
                  alt={product.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2 leading-snug group-hover:text-[#00AEEF] transition-colors">{product.nombre}</h4>
              <p className="font-black text-lg text-gray-900 tracking-tight">${product.precio_individual.toLocaleString()}</p>
              <p className="text-[10px] text-green-500 font-bold uppercase mt-1">Llega gratis mañana</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works Banner */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-white rounded-[3rem] p-10 md:p-20 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-gray-800 leading-tight tracking-tighter uppercase">¿Cómo funciona JUNTOS?</h2>
            <div className="grid grid-cols-1 gap-6">
              {[
                { step: "1", title: "Elegí tu oferta", text: "Buscá el producto que necesitás entre cientos de ofertas grupales activas." },
                { step: "2", title: "Unite al grupo", text: "Sumate a otros compradores para llegar al precio mayorista." },
                { step: "3", title: "Recibilo en tu casa", text: "Una vez que el grupo se completa, el proveedor envía tu pedido." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="w-10 h-10 rounded-xl bg-[#00AEEF]/10 flex-shrink-0 flex items-center justify-center text-[#00AEEF] font-black">{item.step}</div>
                  <div>
                    <h5 className="font-black text-gray-800 uppercase tracking-tight mb-1">{item.title}</h5>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full aspect-square max-w-sm bg-gray-50 rounded-[4rem] border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
               <Truck size={120} className="text-[#00AEEF] opacity-20 transform -rotate-12" />
               <div className="absolute inset-0 bg-gradient-to-t from-[#00AEEF]/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
