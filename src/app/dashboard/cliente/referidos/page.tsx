import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChevronLeft, Share2, Users, Gift, TrendingUp } from "lucide-react";
import Link from "next/link";
import ReferralWidget from "@/components/shared/ReferralWidget";
import ReferralNetwork from "@/components/dashboard/ReferralNetwork";

export default async function ReferidosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  const supabase = await createClient();

  // Fetch Referral Code and User Stats
  const { data: userData } = await supabase
    .from('users')
    .select('referral_code, experience_points')
    .eq('id', session.user.id)
    .single();

  // Fetch Referrals with detailed info
  const { data: referralsRaw } = await supabase
    .from('referrals')
    .select(`
      id,
      status,
      created_at,
      referred:users!referrals_referred_id_fkey (
        id,
        nombre,
        apellido,
        total_saved
      )
    `)
    .eq('referrer_id', session.user.id)
    .order('created_at', { ascending: false });

  const referrals = (referralsRaw || []).map((r: any) => ({
    id: r.id,
    name: `${r.referred.nombre} ${r.referred.apellido || ''}`.trim(),
    joined_at: r.created_at,
    status: r.status as 'pending' | 'completed' | 'paid',
    savings_generated: Number(r.referred.total_saved) || 0
  }));

  const totalSavedByNetwork = referrals.reduce((acc, curr) => acc + curr.savings_generated, 0);

  const referralStats = {
    totalReferrals: referrals.length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalEarned: referrals.filter(r => r.status === 'paid').length * 500
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <Link 
            href="/dashboard/cliente" 
            className="inline-flex items-center gap-2 text-[#009EE3] font-bold text-sm uppercase tracking-widest mb-6 hover:text-[#0077CC] transition-colors"
          >
            <ChevronLeft size={16} /> Volver al Panel
          </Link>
          <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase flex items-center gap-3">
             <Share2 className="text-[#009EE3]" size={32} /> Programa de Referidos
          </h1>
          <p className="text-gray-500 font-medium mt-2">Invitá a tus vecinos y ahorren todos JUNTOS.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main: Network List */}
          <div className="lg:col-span-2">
            <ReferralNetwork 
              referrals={referrals} 
              totalSavedByNetwork={totalSavedByNetwork} 
            />
          </div>

          {/* Sidebar: Invite Tools */}
          <div className="space-y-8">
             <ReferralWidget 
               referralCode={userData?.referral_code || ''} 
               referralStats={referralStats}
             />

             <div className="bg-gradient-to-br from-[#009EE3] to-[#00A650] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#009EE3]/20">
               <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                 <Gift size={24} />
               </div>
               <h3 className="text-xl font-black uppercase tracking-tight mb-2">Premiamos tu esfuerzo</h3>
               <p className="text-white/80 text-sm font-medium leading-relaxed mb-6">
                 Por cada amigo que complete su primera compra, recibís **$500** de crédito directo en tu billetera virtual.
               </p>
               <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4">
                  <TrendingUp size={20} />
                  <span className="text-xs font-black uppercase tracking-widest">¡Sin límites de invitados!</span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
