"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mission, MissionService } from "@/lib/services/missionService";
import { CheckCircle2, Circle, Trophy, Bell, Map, Leaf, Zap } from "lucide-react";

export default function DailyMissions({ userId }: { userId: string }) {
  const [missions, setMissions] = useState<Mission[]>([]);

  useEffect(() => {
    MissionService.getDailyMissions(userId).then(setMissions);
  }, [userId]);

  const iconMap: any = {
    bell: <Bell size={18} />,
    map: <Map size={18} />,
    leaf: <Leaf size={18} />,
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 relative overflow-hidden group">
      {/* Background glow effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 blur-[80px] rounded-full group-hover:bg-amber-500/10 transition-colors" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter text-glow-blue">Misiones Diarias</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ganá XP y dominá tu barrio</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/50 text-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/5">
          <Trophy size={28} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]" />
        </div>
      </div>

      <div className="space-y-6">
        {missions.map((mission, idx) => {
          const isDone = mission.progress >= mission.target;
          const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);

          return (
            <motion.div 
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden ${
                isDone ? 'bg-green-500/10 border-green-500/30' : 'bg-white/30 border-white/50 hover:border-[#009EE3]/30 hover:bg-white/50'
              }`}
            >
              {isDone && <div className="absolute top-0 right-0 p-3 text-glow-green text-green-500"><CheckCircle2 size={16} /></div>}
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isDone ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-100'
                }`}>
                  {isDone ? <CheckCircle2 size={20} /> : iconMap[mission.icon] || <Zap size={20} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`font-black uppercase tracking-tight text-xs ${isDone ? 'text-green-700' : 'text-slate-800'}`}>
                      {mission.title}
                    </h4>
                    <span className="text-[10px] font-black text-[#009EE3] bg-blue-50 px-2 py-0.5 rounded-lg">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <p className={`text-[11px] font-medium leading-relaxed ${isDone ? 'text-green-600/70' : 'text-slate-400'}`}>
                    {mission.description}
                  </p>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-1.5">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progreso</span>
                       <span className="text-[9px] font-black text-slate-700">{mission.progress} / {mission.target}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${progressPercent}%` }}
                         className={`h-full rounded-full ${isDone ? 'bg-green-500' : 'bg-[#009EE3]'}`}
                       />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <button className="w-full mt-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#009EE3] transition-colors border-2 border-dashed border-slate-100 rounded-2xl">
        Ver todas las misiones
      </button>
    </div>
  );
}
