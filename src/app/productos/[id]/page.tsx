import React from "react";
import Link from "next/link";
import { ArrowLeft, Users, Timer, Info, Star, Share2, ShieldCheck, Truck, ChevronRight, Award, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import JoinDealButton from "@/components/group-deals/JoinDealButton";
import GroupAvatars from "@/components/group-deals/GroupAvatars";
import CountdownTimer from "@/components/shared/CountdownTimer";
import ProductGallery from "@/components/products/ProductGallery";
import ProductShareActions from "@/components/products/ProductShareActions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { isDealActive, formatCurrency } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const supabase = await createClient();
  const { id } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('*, group_deals (*)')
    .eq('id', id)
    .single();

  if (!product) {
    return { title: 'Producto no encontrado | BANDHA' };
  }

  const activeDeal = product.group_deals?.find((d: any) => isDealActive(d));
  const price = activeDeal ? activeDeal.precio_actual : product.precio_individual;
  const discount = activeDeal ? Math.round((1 - price / product.precio_individual) * 100) : 0;
  const remaining = activeDeal ? activeDeal.min_participantes - activeDeal.participantes_actuales : 0;

  const baseUrl = process.env.NEXTAUTH_URL || 'https://bandha.com.ar';

  const ogTitle = activeDeal && remaining > 0
    ? `¡Falta${remaining === 1 ? '' : 'n'} solo ${remaining} para desbloquear ${discount}% OFF en ${product.nombre}!`
    : `${product.nombre} — $${price.toLocaleString()} en BANDHA`;

  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(product.nombre)}&price=${price}&originalPrice=${product.precio_individual}&discount=${discount}&image=${encodeURIComponent(product.imagen_principal || '')}&participants=${activeDeal?.participantes_actuales || 0}&minParticipants=${activeDeal?.min_participantes || 5}`;

  return {
    title: `${product.nombre} | BANDHA`,
    description: ogTitle,
    openGraph: {
      title: ogTitle,
      description: `Comprá en grupo y ahorrá ${discount}% en ${product.nombre}. Precio grupal: $${price.toLocaleString()}`,
      url: `${baseUrl}/productos/${id}`,
      siteName: 'BANDHA',
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      locale: 'es_AR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: `Precio grupal: $${price.toLocaleString()} (${discount}% OFF)`,
      images: [ogImageUrl],
    },
  };
}

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
      providers (nombre_empresa),
      group_deals (*)
    `)
    .eq('id', id)
    .single();

  // Fetch related products (same category, excluding current)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('categoria', product?.categoria)
    .neq('id', id)
    .limit(4);

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-3xl font-black text-bandha-text uppercase tracking-tighter mb-4">Producto no encontrado</h1>
        <p className="text-bandha-text-secondary mb-8 font-medium">La oferta que buscás ya no está disponible o no existe.</p>
        <Link
          href="/"
          className="bg-bandha-primary hover:bg-bandha-secondary text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-bandha-primary/20 transition-all uppercase tracking-tight"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const activeDeal = product.group_deals?.find((d: any) => isDealActive(d));
  const price = activeDeal ? activeDeal.precio_actual : product.precio_individual;
  const originalPrice = product.precio_individual;
  const discount = activeDeal ? Math.round((1 - price / originalPrice) * 100) : 0;
  const progress = activeDeal ? (activeDeal.participantes_actuales / activeDeal.min_participantes) * 100 : 0;

  return (
    <div className="min-h-screen bg-bandha-bg pb-24 md:pb-12 pt-4">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-bold text-bandha-text-muted uppercase tracking-widest mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/" className="hover:text-bandha-primary transition-colors">Volver al listado</Link>
          <ChevronRight size={14} />
          <Link href={`/buscar?categoria=${product.categoria}`} className="hover:text-bandha-primary transition-colors">{product.categoria}</Link>
          <ChevronRight size={14} />
          <span className="text-bandha-text-secondary truncate">{product.nombre}</span>
        </div>

        <div className="bg-bandha-surface rounded-[2rem] md:rounded-[3rem] shadow-sm border border-bandha-border overflow-hidden flex flex-col lg:flex-row">

          {/* Columna Izquierda: Galería de Imágenes Interactiva */}
          <ProductGallery
            images={product.imagenes || []}
            mainImage={product.imagen_principal}
            productName={product.nombre}
            discount={discount}
          />

          {/* Columna Derecha: Detalles y CTA */}
          <div className="lg:w-2/5 p-6 md:p-10 lg:p-12 flex flex-col">

            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] md:text-xs font-black uppercase text-bandha-text-muted tracking-widest">
                Nuevo | +100 vendidos
              </span>
              <div className="flex gap-3 text-bandha-text-muted">
                <button className="hover:text-bandha-primary transition-colors active:scale-95"><Share2 size={20} /></button>
                <button className="hover:text-bandha-primary transition-colors active:scale-95"><Star size={20} /></button>
              </div>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-bandha-text leading-[1.1] tracking-tighter mb-2">
              {product.nombre}
            </h1>

            <p className="text-[13px] font-bold text-bandha-text-muted mb-8 flex items-center gap-1.5 uppercase tracking-wide">
              Vendido por <span className="text-bandha-primary">
                {product.providers?.nombre_empresa ||
                  (Array.isArray(product.providers) ? product.providers[0]?.nombre_empresa : null) ||
                  product.provider?.nombre_empresa ||
                  "Proveedor Verificado"}
              </span>
              <Award size={14} className="text-bandha-primary" />
            </p>

            {/* PRECIOS SOPHISTICATED HIERARCHY */}
            <div className="mb-8">
              {activeDeal && (
                <div className="text-xs md:text-sm font-medium text-bandha-text-muted line-through mb-1.5 ml-1">
                  ${originalPrice.toLocaleString()} individual
                </div>
              )}
              <div className="flex flex-nowrap items-center gap-3 bg-bandha-secondary/5 border border-bandha-secondary/15 px-5 py-4 rounded-[2rem] w-fit shadow-sm overflow-hidden ring-1 ring-bandha-secondary/5">
                <span className="text-[clamp(1.5rem,5vw,2.5rem)] md:text-4xl font-black text-bandha-text tracking-tighter leading-none shrink-0 whitespace-nowrap">
                  ${price.toLocaleString()}
                </span>
                {activeDeal && (
                  <div className="flex flex-col border-l border-bandha-secondary/20 pl-3 shrink-0 leading-[0.85]">
                    <span className="text-[11px] md:text-[12px] font-black text-bandha-secondary uppercase tracking-tighter">
                      OFERTA
                    </span>
                    <span className="text-[11px] md:text-[12px] font-black text-bandha-secondary uppercase tracking-tighter">
                      GRUPAL
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-[12px] text-bandha-primary font-bold mt-3 flex items-center gap-1.5 uppercase tracking-wide">
                <Truck size={14} /> Envío coordinado al completar
              </p>
            </div>

            {/* CENTRO DE CONTROL DE OFERTA (ULTRA COMPACTO) */}
            {activeDeal && (
              <div className="bg-bandha-surface rounded-[1.25rem] p-4 md:p-5 mb-8 border border-bandha-border shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative overflow-hidden group/progress">
                <div className="flex flex-col gap-3 relative z-10">

                  {/* Fila Superior: Timer con Etiqueta */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-base font-black text-bandha-text tracking-tighter uppercase shrink-0">
                      ¡FINALIZA EN:
                    </span>
                    <CountdownTimer
                      targetDate={activeDeal.fecha_vencimiento}
                      className="text-xl md:text-2xl font-black"
                      iconSize={18}
                    />
                  </div>

                  {/* Fila Media: Avatares Modulares (Efecto Zeigarnik) */}
                  <GroupAvatars
                    current={activeDeal.participantes_actuales}
                    min={activeDeal.min_participantes}
                  />

                  {/* Barra de Progreso Dominante y Vibrante */}
                  <div className="space-y-2.5">
                    <div className="h-2.5 w-full bg-bandha-subtle rounded-full overflow-hidden relative shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-bandha-secondary via-bandha-secondary to-bandha-primary rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                        style={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-bandha-text-secondary bg-bandha-primary/5 py-1.5 px-3 rounded-lg border border-bandha-primary/5 self-start">
                      <ShieldCheck size={13} className="text-bandha-primary shrink-0" />
                      <span className="leading-tight">Si no hay quórum, se reintegra el dinero automáticamente.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOTONES DE ACCIÓN (Desktop) */}
            <div className="hidden md:flex flex-col gap-4 mb-10 w-full mt-auto">
              <div className="flex flex-col gap-3">
                {activeDeal && (
                  <div className="w-full">
                    <JoinDealButton dealId={activeDeal.id} targetDate={activeDeal.fecha_vencimiento} />
                  </div>
                )}

                <button className="w-full py-4 bg-bandha-surface hover:bg-bandha-subtle text-bandha-text-secondary font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 border-2 border-bandha-border uppercase tracking-tight text-sm">
                  <span>Comprar Individual</span>
                  <span className="opacity-60">—</span>
                  <span className="font-black text-bandha-text">${originalPrice.toLocaleString()}</span>
                </button>
              </div>

              {/* Acciones de Soporte / Compartir Sutiles */}
              <div className="flex items-center justify-between pt-2 border-t border-bandha-border">
                <p className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest">
                  Compartir oferta:
                </p>
                <ProductShareActions
                  productName={product.nombre}
                  price={price}
                  productId={id}
                  baseUrl={process.env.NEXTAUTH_URL || 'https://bandha.com.ar'}
                />
              </div>

              <p className="text-[10px] font-bold text-center text-bandha-text-muted uppercase tracking-widest mt-2">
                Sin cargos si el grupo no se completa.
              </p>
            </div>

            {/* TRUST BADGES */}
            <div className="space-y-4 pt-8 border-t border-bandha-border text-sm font-medium text-bandha-text-secondary">
              <div className="flex items-start gap-4">
                <ShieldCheck size={24} className="text-bandha-text-muted shrink-0" />
                <div>
                  <span className="text-bandha-text font-bold block mb-0.5">Compra Protegida</span>
                  Recibí el producto que esperabas o te devolvemos tu dinero.
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Award size={24} className="text-bandha-text-muted shrink-0" />
                <div>
                  <span className="text-bandha-text font-bold block mb-0.5">Garantía BANDHA</span>
                  Todo proveedor pasa por un riguroso proceso de validación.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* DESCRIPCION EXTENDIDA */}
        <div className="mt-8 bg-bandha-surface rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-sm border border-bandha-border">
          <h2 className="text-2xl font-black text-bandha-text tracking-tighter uppercase mb-8 flex items-center gap-3">
            <Info className="text-bandha-primary" size={28} />
            Descripción del producto
          </h2>
          <div className="prose prose-slate max-w-3xl text-bandha-text-secondary font-medium leading-relaxed whitespace-pre-line text-sm md:text-base">
            {product.descripcion}
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl md:text-2xl font-black text-bandha-text uppercase tracking-tighter mb-8 px-2">Quienes vieron esto también compraron</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p: any) => (
                <Link
                  href={`/productos/${p.id}`}
                  key={p.id}
                  className="bg-bandha-surface rounded-3xl p-4 md:p-6 shadow-sm hover:shadow-xl hover:shadow-bandha-primary/10 transition-all border border-bandha-border group flex flex-col"
                >
                  <div className="aspect-square bg-bandha-subtle rounded-2xl mb-4 overflow-hidden">
                    <img
                      src={p.imagen_principal || "/placeholder-product.jpg"}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-bold text-bandha-text text-xs md:text-sm mb-2 line-clamp-2 leading-snug group-hover:text-bandha-primary transition-colors">{p.nombre}</h4>
                  <div className="mt-auto">
                    <p className="font-black text-base md:text-lg text-bandha-text tracking-tight">${p.precio_individual.toLocaleString()}</p>
                    <p className="text-[11px] text-bandha-secondary font-black uppercase mt-1 tracking-widest">Oferta disponible</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* FIXED ACTION BAR (Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-bandha-surface/95 backdrop-blur-md p-4 pb-8 border-t border-bandha-border flex flex-col gap-3 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <button className="flex-1 h-12 bg-bandha-surface text-bandha-text-secondary font-bold rounded-xl border border-bandha-border active:scale-95 flex flex-col items-center justify-center leading-none">
            <span className="text-[11px] uppercase tracking-widest mb-0.5">Individual</span>
            <span className="text-sm font-black text-bandha-text">${originalPrice.toLocaleString()}</span>
          </button>
          {activeDeal && (
            <div className="flex-[2] h-12">
              <JoinDealButton dealId={activeDeal.id} targetDate={activeDeal.fecha_vencimiento} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
