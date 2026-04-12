"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import CountdownTimer from "@/components/shared/CountdownTimer";
import GroupAvatars from "@/components/group-deals/GroupAvatars";
import { ShieldCheck, Eye, Zap, UserPlus, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  dealId: string;
  initialParticipants: number;
  minParticipants: number;
  targetDate: string;
}

export default function RealtimeDealProgress({ dealId, initialParticipants, minParticipants, targetDate }: Props) {
  const [currentParticipants, setCurrentParticipants] = useState(initialParticipants);
  const [liveViewers, setLiveViewers] = useState(0);
  const [showNewJoiner, setShowNewJoiner] = useState(false);
  const supabase = createClient();

  // Social Proof: Random viewers (simulated)
  useEffect(() => {
    setLiveViewers(Math.floor(Math.random() * 5) + 3);
    const interval = setInterval(() => {
      setLiveViewers(prev => Math.max(2, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`public:group_deals:id=eq.${dealId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_deals', filter: `id=eq.${dealId}` },
        (payload) => {
          if (payload.new && typeof payload.new.participantes_actuales === 'number') {
            const isNew = payload.new.participantes_actuales > currentParticipants;
            setCurrentParticipants(payload.new.participantes_actuales);
            if (isNew) {
               setShowNewJoiner(true);
               setTimeout(() => setShowNewJoiner(false), 5000);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealId, supabase, currentParticipants]);

  const progress = Math.max(0, (currentParticipants / minParticipants) * 100);

  return (
    <div className="glass-card p-6 mb-8 border-white/50 relative overflow-hidden">
      <div className="flex flex-col gap-5 relative z-10">
        
        {/* Countdown Header (Exclusive Look) */}
        <div className="flex items-center justify-between pb-4 border-b border-brand-midnight/5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            <Clock size={14} className="text-brand-violet" /> Cierre de Oferta
          </div>
          <CountdownTimer
            targetDate={targetDate}
            className="text-xl font-bold text-brand-midnight tracking-tight"
            iconSize={0}
          />
        </div>

        {/* Participants Info */}
        <div className="flex items-center justify-between">
           <div className="space-y-1">
             <span className="text-xs font-bold text-slate-400 uppercase">Estado del Grupo</span>
             <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-brand-midnight tracking-tighter">{currentParticipants} / {minParticipants}</span>
                <span className="text-[10px] bg-brand-violet/10 text-brand-violet px-2 py-0.5 rounded-full font-bold">RESERVAS</span>
             </div>
           </div>
           <GroupAvatars current={currentParticipants} min={minParticipants} />
        </div>

        {/* Progress Bar (High-Tech) */}
        <div className="space-y-3">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-[1px]">
            <motion.div
              initial={false}
              animate={{ width: `${Math.max(2, Math.min(100, progress))}%` }}
              className="h-full bg-gradient-to-r from-brand-violet to-brand-emerald rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(124,58,237,0.2)]"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
             <div className="flex items-center gap-2 text-[10px] font-bold text-brand-midnight/60">
               <ShieldCheck size={14} className="text-brand-emerald" />
               <span className="uppercase tracking-wider">Transacción Protegida</span>
             </div>

             <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                <div className="pulse-emerald">
                   <span></span>
                   <span></span>
                </div>
                <span>{liveViewers} VIVIENDO LA OFERTA</span>
             </div>
          </div>
        </div>
      </div>

      {/* NEW JOINER TOAST (Signature Style) */}
      <AnimatePresence>
        {showNewJoiner && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 glass-card py-2 px-4 rounded-full flex items-center gap-2 z-50 shadow-2xl border-brand-violet/30"
          >
            <UserPlus size={14} className="text-brand-violet" />
            <span className="text-[10px] font-bold text-brand-violet">¡Vecino sumado!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* URGENCY BADGE (Signature Style) */}
      {progress >= 80 && (
         <div className="absolute top-0 right-0">
            <div className="bg-brand-midnight text-white text-[9px] font-bold px-4 py-2 rounded-bl-2xl flex items-center gap-1.5 shadow-xl">
               <Sparkles size={10} className="text-brand-violet" fill="currentColor" /> EDICIÓN LIMITADA
            </div>
         </div>
      )}
    </div>
  );
}
