import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, Users, Clock, Package, ChevronRight, Settings, Leaf } from "lucide-react";
import Link from "next/link";
import ReferralWidget from "@/components/shared/ReferralWidget";
import StreakWidget from "@/components/shared/StreakWidget";
import ImpactStats from "@/components/shared/ImpactStats";
import LevelBadge from "@/components/dashboard/LevelBadge";
import BadgeGallery from "@/components/dashboard/BadgeGallery";
import ImpactDashboard from "@/components/dashboard/ImpactDashboard";
import NeighborhoodPulse from "@/components/dashboard/NeighborhoodPulse";
import NeighborhoodChallenge from "@/components/dashboard/NeighborhoodChallenge";
import NeighborhoodInsights from "@/components/dashboard/NeighborhoodInsights";
import SubscriptionManager from "@/components/dashboard/SubscriptionManager";
import { calculateLevel } from "@/lib/gamification";

export default async function ClienteDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Si el usuario no es cliente (por ejemplo proveedor), redirigir
  if (session.user.rol !== "cliente") {
    // Si es proveedor, redirigir a su dashboard
    if (session.user.rol === "proveedor") {
      redirect("/provider/dashboard");
    } else if (session.user.rol === "admin") {
      redirect("/gestion-bandha");
    }
  }

  const supabase = await createClient();

  // Fetch real orders with deal and product details (Support for both Group Deals and Multi-cart)
  const { data: realOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      estado,
      creado_en,
      group_deal_id,
      order_items (
        id,
        quantity,
        product:products (
          nombre,
          imagen_principal
        )
      )
    `)
    .eq('user_id', session.user.id)
    .order('creado_en', { ascending: false });

  // Map database results to the format expected by the UI
  const orders = (realOrders || []).map(order => {
    // Para multicarrito, mostramos el primer item y un "+X" si hay más
    const firstItem = order.order_items?.[0] as any;
    const productCount = order.order_items?.length || 0;
    const productName = firstItem?.product?.nombre || "Pedido BANDHA";
    const displayName = productCount > 1 ? `${productName} + ${productCount - 1}` : productName;

    return {
      id: order.id,
      product: displayName,
      status: order.estado,
      price: Number(order.total),
      date: new Date(order.creado_en).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      image: firstItem?.product?.imagen_principal,
      isGroupDeal: !!order.group_deal_id
    };
  });

  // Fetch Referral Stats
  const { data: referralData } = await supabase
    .from('referrals')
    .select('status, reward_amount')
    .eq('referrer_id', session.user.id);

  // Fetch User Stats (Streak & Total Saved)
  const { data: userData } = await supabase
    .from('users')
    .select('savings_streak, total_saved, experience_points, current_level, carbon_saved, neighborhood')
    .eq('id', session.user.id)
    .single();

  // ... (userBadges fetch remains unchanged)
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select(`
      id,
      creado_en,
      badge:badges (
        id,
        nombre,
        descripcion,
        icon_name
      )
    `)
    .eq('user_id', session.user.id);

  const formattedBadges = (userBadges || []).map((ub: any) => ({
    ...ub.badge,
    creado_en: ub.creado_en
  }));

  const userXp = userData?.experience_points || 0;
  const currentLevel = calculateLevel(userXp);

  // Fetch Neighborhood Impact (Use user's neighborhood if available)
  const userNeighborhood = userData?.neighborhood || 'Caballito';
  const { data: impactData } = await supabase
    .from('neighborhood_impact')
    .select('*')
    .eq('zone_name', userNeighborhood)
    .maybeSingle();

  const referralStats = {
    totalReferrals: referralData?.length || 0,
    pendingReferrals: referralData?.filter(r => r.status === 'pending').length || 0,
    totalEarned: referralData?.filter(r => r.status === 'completed' || r.status === 'paid')
      .reduce((acc, curr) => acc + (Number(curr.reward_amount) || 0), 0) || 0
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-[#009EE3] flex items-center justify-center overflow-hidden">
               {session.user.image ? (
                 <img src={session.user.image} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-black text-[#009EE3]">{session.user.name?.[0]}</span>
               )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Hola, {session.user.name?.split(' ')[0]}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[#009EE3] font-bold uppercase tracking-widest text-xs">{currentLevel.name}</p>
                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                <p className="text-[#00A650] font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
                   <Leaf size={10} /> Eco-Activo
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/perfil" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Settings size={18} /> Mi Perfil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Purchases */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-[#009EE3]" size={24} /> Mis Compras Grupales
              </h2>
            </div>
            
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-100 shadow-sm">
                  <Package className="mx-auto text-gray-200 mb-6" size={64} />
                  <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">Aún no tienes compras</h3>
                  <p className="text-gray-400 text-sm mt-2 mb-8">¡Explora las ofertas increíbles que tenemos para vos!</p>
                  <Link href="/productos" className="bg-[#009EE3] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-[#009EE3]/20 hover:scale-105 transition-transform inline-block">
                    Ver Oportunidades
                  </Link>
                </div>
              ) : orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl hover:shadow-[#009EE3]/5 transition-all">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-50">
                    {order.image ? (
                        <img src={order.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <Package className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left min-w-0">
                    <h4 className="text-lg font-black text-gray-800 mb-1 truncate tracking-tight">{order.product}</h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 text-[10px] font-bold uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5 text-gray-400">
                        <Clock size={12} /> {order.date}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg border ${
                        order.status === 'pagado' ? 'bg-green-50 text-green-600 border-green-100' : 
                        order.status === 'pendiente_pago' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      {order.isGroupDeal && (
                        <span className="bg-[#009EE3]/10 text-[#009EE3] px-2.5 py-0.5 rounded-lg border border-[#009EE3]/10">Grupal</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-1 px-4 min-w-[120px]">
                     <span className="text-2xl font-black text-gray-900 leading-none">${order.price.toLocaleString()}</span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Total Pedido</span>
                  </div>
                  <ChevronRight className="text-gray-200 group-hover:text-[#009EE3] group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>

            {/* NEIGHBORHOOD INTELLIGENCE */}
            <div className="mt-12 mb-12 py-8 border-t border-gray-100">
               <NeighborhoodInsights neighborhoodId="Palermo" />
            </div>

            {/* SUBSCRIPTION MANAGEMENT (MIS FIJOS) */}
            <div className="pt-8 border-t border-gray-100">
               <SubscriptionManager />
            </div>
          </div>

          {/* Sidebar: Stats / Promos */}
          <div className="space-y-8">
            {/* Widget de Nivel */}
            <LevelBadge xp={userXp} />

            {/* Galería de Medallas */}
            <BadgeGallery badges={formattedBadges} />

            {/* Componente de Referidos */}
            <Link href="/dashboard/cliente/referidos" className="block transition-transform hover:scale-[1.02]">
              <ReferralWidget 
                referralCode={session?.user?.referral_code || ''} 
                referralStats={referralStats}
              />
            </Link>

            {/* Widget de Racha */}
            <StreakWidget streak={userData?.savings_streak || 0} />

            {/* Pulso Barrial */}
            <NeighborhoodPulse />
            
            {/* NEIGHBORHOOD CHALLENGE */}
            <div className="mt-6">
              <NeighborhoodChallenge neighborhoodId="Palermo" /> 
            </div>
          </div>
        </div>

        {/* Sección de Impacto Social & Eco (Full Width) */}
        <section className="pt-8 border-t border-gray-100">
          <ImpactDashboard 
            userCarbonSaved={Number(userData?.carbon_saved) || 0}
            neighborhoodName={userNeighborhood}
            neighborhoodCarbonTotal={Number(impactData?.carbon_saved_total) || 0}
            neighborhoodSavingsTotal={Number(impactData?.total_collective_savings) || 0}
          />
        </section>
      </div>
    </div>
  );
}
