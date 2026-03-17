import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, Users, Clock, Package, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import ReferralWidget from "@/components/shared/ReferralWidget";
import StreakWidget from "@/components/shared/StreakWidget";
import ImpactStats from "@/components/shared/ImpactStats";

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

  // Fetch real orders with deal and product details
  const { data: realOrders } = await supabase
    .from('orders')
    .select(`
      id,
      total,
      estado,
      creado_en,
      group_deal:group_deals (
        id,
        participantes_actuales,
        min_participantes,
        estado,
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
    // Supabase returns related objects as objects OR arrays depending on complexity
    const deal = (Array.isArray(order.group_deal) ? order.group_deal[0] : order.group_deal) as any;
    const product = (deal && Array.isArray(deal.product) ? deal.product[0] : deal?.product) as any;

    return {
      id: order.id,
      product: product?.nombre || "Producto desconocido",
      status: deal?.estado || "desconocido",
      participants: deal?.participantes_actuales || 0,
      min: deal?.min_participantes || 1,
      price: Number(order.total),
      date: new Date(order.creado_en).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }),
      image: product?.imagen_principal
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
    .select('savings_streak, total_saved')
    .eq('id', session.user.id)
    .single();

  // Fetch Neighborhood Impact (Default zone for now)
  const { data: impactData } = await supabase
    .from('neighborhood_impact')
    .select('*')
    .eq('zone_name', 'Caballito/Almagro')
    .single();

  const referralStats = {
    totalReferrals: referralData?.length || 0,
    pendingReferrals: referralData?.filter(r => r.status === 'pending').length || 0,
    totalEarned: referralData?.filter(r => r.status === 'completed' || r.status === 'paid')
      .reduce((acc, curr) => acc + (Number(curr.reward_amount) || 0), 0) || 0
  };

  return (
    <div className="min-h-screen bg-bandha-bg pb-24">
      {/* ... header ... */}
      <div className="bg-bandha-surface border-b border-bandha-border">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-bandha-subtle border-2 border-bandha-primary flex items-center justify-center overflow-hidden">
               {session.user.image ? (
                 <img src={session.user.image} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-black text-bandha-primary">{session.user.name?.[0]}</span>
               )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-bandha-text tracking-tighter uppercase">Hola, {session.user.name?.split(' ')[0]}</h1>
              <p className="text-bandha-text-secondary font-medium">Nivel Comprador BANDHA</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/perfil" className="flex items-center gap-2 px-6 py-3 bg-bandha-surface border border-bandha-border rounded-xl font-bold text-sm text-bandha-text-secondary hover:bg-bandha-subtle transition-all shadow-sm">
              <Settings size={18} /> Mi Perfil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Purchases */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-bandha-text uppercase tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-bandha-primary" size={24} /> Mis Compras Grupales
              </h2>
            </div>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-bandha-surface rounded-3xl p-6 md:p-8 shadow-sm border border-bandha-border flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:shadow-xl hover:shadow-bandha-primary/5 transition-all">
                  <div className="w-24 h-24 bg-bandha-subtle rounded-2xl flex-shrink-0 flex items-center justify-center text-bandha-text-muted">
                    <Package size={40} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-bandha-text mb-1">{order.product}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-bandha-text-muted uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {order.date}</span>
                      <span className={`flex items-center gap-1.5 ${order.status === 'activo' ? 'text-bandha-primary' : 'text-bandha-secondary'}`}>
                        <div className={`w-2 h-2 rounded-full ${order.status === 'activo' ? 'bg-bandha-primary animate-pulse' : 'bg-bandha-secondary'}`} />
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2">
                     <span className="text-2xl font-black text-bandha-text">${order.price.toLocaleString()}</span>
                     <div className="w-32 h-2 bg-bandha-subtle rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${order.status === 'activo' ? 'from-bandha-primary to-bandha-secondary' : 'from-green-400 to-green-600'} rounded-full`}
                          style={{ width: `${(order.participants / order.min) * 100}%` }}
                        />
                     </div>
                     <span className="text-[10px] font-black text-bandha-text-muted">{order.participants}/{order.min} unidos</span>
                  </div>
                  <ChevronRight className="text-bandha-text-muted hidden md:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Stats / Promos */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-bandha-primary to-bandha-secondary rounded-[2.5rem] p-8 text-white shadow-xl shadow-bandha-primary/20">
               <h3 className="text-lg font-black uppercase tracking-tight mb-4">Ahorro Acumulado</h3>
               <div className="text-4xl font-black mb-2">$12.500</div>
               <p className="text-white/70 font-medium text-sm">Gracias a comprar en grupo este mes.</p>
               <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span>Próximo Rango</span>
                  <span>75%</span>
               </div>
               <div className="h-1.5 w-full bg-white/20 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-white w-3/4 rounded-full" />
               </div>
            </div>

            {/* Widget de Racha */}
            <StreakWidget streak={userData?.savings_streak || 0} />

            {/* Componente de Referidos */}
            <ReferralWidget 
              referralCode={session?.user?.referral_code || ''} 
              referralStats={referralStats}
            />

            {/* Impacto Barrial */}
            <ImpactStats 
                zone={impactData?.zone_name || 'Tu Barrio'}
                totalSaved={impactData?.total_collective_savings || 0}
                activeUsers={impactData?.active_users_count || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
