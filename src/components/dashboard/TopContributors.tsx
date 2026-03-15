"use client";

import { useEffect } from "react";
import { useChallengeStore } from "@/store/challengeStore";
import { motion } from "framer-motion";
import { User, Medal, ArrowUpRight } from "lucide-react";

export default function TopContributors({ challengeId }: { challengeId: string }) {
  const { topContributors, fetchTopContributors } = useChallengeStore();
  const contributors = topContributors[challengeId] || [];

  useEffect(() => {
    if (challengeId) {
      fetchTopContributors(challengeId);
    }
  }, [challengeId, fetchTopContributors]);

  if (contributors.length === 0) return null;

  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 mt-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-gray-800 uppercase tracking-tight">Top Motores del Barrio</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Los vecinos que más empujan la meta</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
          <Medal className="text-orange-500" size={20} />
        </div>
      </div>

      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <motion.div
            key={contributor.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-3xl bg-gray-50/50 border border-gray-50 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                  {contributor.avatar_url ? (
                    <img src={contributor.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="text-gray-300" size={24} />
                  )}
                </div>
                <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                  index === 1 ? 'bg-slate-300 text-slate-700' :
                  index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-500'
                }`}>
                  {index + 1}
                </div>
              </div>
              <div>
                <div className="text-sm font-black text-gray-800 tracking-tight">{contributor.user_name}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ahorro aportado</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-[#00A650] tracking-tighter flex items-center gap-1 justify-end">
                +${contributor.contribution_value.toLocaleString()}
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
