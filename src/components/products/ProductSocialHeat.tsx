'use client';

import React, { useEffect, useState } from 'react';
import { Users, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialHeatProps {
  dealId: string;
  neighborhood?: string;
  currentParticipants: number;
  minParticipants: number;
}

export default function ProductSocialHeat({ dealId, neighborhood, currentParticipants, minParticipants }: SocialHeatProps) {
  const [neighborCount, setNeighborCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch how many people from this neighborhood are in this specific deal
    // For now, we simulate with a subset or fetch from a new endpoint
    if (neighborhood) {
      fetch(`/api/neighborhood/deal-stats?dealId=${dealId}&neighborhood=${neighborhood}`)
        .then(res => res.json())
        .then(data => {
          setNeighborCount(data.count || 0);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dealId, neighborhood]);

  if (loading) return (
    <div className="h-20 bg-bandha-subtle/50 rounded-2xl animate-pulse" />
  );

  const percentage = Math.min((currentParticipants / minParticipants) * 100, 100);
  const isHighHeat = percentage > 70;

  return (
    <div className="bg-white border-2 border-black p-5 space-y-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-black pb-3">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 border border-black flex items-center justify-center ${isHighHeat ? 'bg-[#FF5C00] text-white' : 'bg-black text-white'}`}>
            <TrendingUp size={24} className={isHighHeat ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h4 className="text-[11px] font-black text-black uppercase tracking-[0.2em]">ESTADO DEL GRUPO</h4>
            <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.1em]">ACTIVIDAD EN TIEMPO REAL</p>
          </div>
        </div>
        <div className="flex -space-x-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-10 h-10 border-2 border-white bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 10}`} alt="" />
            </div>
          ))}
          <div className="w-10 h-10 border-2 border-white bg-[#FF5C00] flex items-center justify-center text-[10px] font-black text-white">
            +{currentParticipants}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black text-black/40 uppercase tracking-widest text-[9px]">PROGRESO DEL AHORRO</span>
          <span className="text-2xl font-black text-black tracking-tighter tabular-nums">{Math.round(percentage)}%</span>
        </div>
        <div className="h-4 w-full bg-[#F5F5F5] border border-black overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={`h-full transition-all duration-1000 ${isHighHeat ? 'bg-[#FF5C00]' : 'bg-black'}`}
          />
        </div>
      </div>

      {neighborhood && neighborCount !== null && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 p-4 bg-[#F9F9F9] border border-black"
        >
          <div className="w-12 h-12 bg-white border border-black flex items-center justify-center text-[#FF5C00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-black uppercase tracking-tight">
              HAY <span className="text-[#FF5C00]">{neighborCount} VECINOS</span> DE <span className="text-[#FF5C00] uppercase">{neighborhood}</span>
            </p>
            <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em] mt-1">
              SUMADOS A ESTA OFERTA AHORA MISMO
            </p>
          </div>
        </motion.div>
      )}

      {(!neighborhood || neighborCount === 0) && (
        <div className="flex items-center gap-3 p-4 bg-[#F5F5F5] border border-black border-dashed">
           <ShieldCheck size={20} className="text-black/20" />
           <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">
             IDENTIDAD VERIFICADA POR BANDHA
           </p>
        </div>
      )}
    </div>
  );
}
