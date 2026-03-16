"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, UserCheck, ShieldCheck } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  item: string;
  time: string;
}

export default function SocialProof() {
  const [activities, setActivities] = useState<Activity[]>([
    { id: "1", user: "Martín", action: "se unió a", item: "Auriculares Sony", time: "hace 2 min" },
    { id: "2", user: "Sofía", action: "compró", item: "Cafetera Express", time: "hace 5 min" },
    { id: "3", user: "Lucas", action: "se unió a", item: "Smart TV 55\"", time: "hace 8 min" },
    { id: "4", user: "Valentina", action: "completó el grupo de", item: "Mochila Tech", time: "hace 10 min" },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [activities.length]);

  return (
    <div className="w-full bg-gray-50 border-y border-gray-100 py-3 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        
        {/* Real-time stats */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
              Comunidad Activa: <span className="text-gray-900">4,281 unidos</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <TrendingUp size={14} className="text-[#009EE3]" />
            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">
              Ahorro Total: <span className="text-[#00A650]">$1,482,900</span>
            </span>
          </div>
        </div>

        {/* Activity Ticker */}
        <div className="relative h-6 flex-1 flex items-center justify-center md:justify-end overflow-hidden max-w-md w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activities[currentIndex].id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-gray-600"
            >
              <UserCheck size={14} className="text-[#009EE3]" />
              <span className="font-black text-gray-900">{activities[currentIndex].user}</span>
              <span>{activities[currentIndex].action}</span>
              <span className="font-black text-[#009EE3] uppercase">{activities[currentIndex].item}</span>
              <span className="text-gray-400 font-medium">({activities[currentIndex].time})</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust badges */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            <ShieldCheck size={12} className="text-[#00A650]" />
            <span className="text-[10px] font-black text-gray-800 uppercase tracking-tighter text-nowrap">
              Pagos Protegidos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
