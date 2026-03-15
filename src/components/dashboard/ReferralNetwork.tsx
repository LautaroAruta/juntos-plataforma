"use client";

import React from "react";
import { Users, TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface ReferredUser {
  id: string;
  name: string;
  joined_at: string;
  status: 'pending' | 'completed' | 'paid';
  savings_generated: number;
}

interface ReferralNetworkProps {
  referrals: ReferredUser[];
  totalSavedByNetwork: number;
}

export default function ReferralNetwork({ referrals, totalSavedByNetwork }: ReferralNetworkProps) {
  return (
    <div className="space-y-8">
      {/* Network Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00AEEF] flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Red Social</div>
          <div className="text-2xl font-black text-slate-800">{referrals.length} Vecinos</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center mb-4">
            <TrendingUp size={20} />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ahorro Generado</div>
          <div className="text-2xl font-black text-slate-800">${totalSavedByNetwork.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
            <DollarSign size={20} />
          </div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tu Comisión</div>
          <div className="text-2xl font-black text-slate-800">${(referrals.filter(r => r.status === 'paid').length * 500).toLocaleString()}</div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Estado de Invitados</h3>
        
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 font-medium">Aún no invitaste a nadie. ¡Compartí tu link y empezá a ganar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((ref, index) => (
              <motion.div 
                key={ref.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#00AEEF]/10 hover:bg-white transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                    {ref.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{ref.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Se unió el {new Date(ref.joined_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ahorró</p>
                    <p className="text-sm font-black text-[#00A650]">${ref.savings_generated.toLocaleString()}</p>
                  </div>

                  <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                    ref.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' :
                    ref.status === 'completed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {ref.status === 'paid' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {ref.status === 'paid' ? 'Completado' : ref.status === 'completed' ? 'Confirmando' : 'Pendiente'}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
