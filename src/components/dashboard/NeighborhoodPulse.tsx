"use client";

import { MapPin, TrendingUp, Users, Award, Shell } from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  neighborhood: string;
  amount: number;
  description: string;
  type: 'saving' | 'deal_closed' | 'impact';
}

export default function NeighborhoodPulse() {
  const achievements: Achievement[] = [
    { id: '1', neighborhood: 'Caballito', amount: 45200, description: 'Ahorro grupal en Verduras Orgánicas', type: 'saving' },
    { id: '2', neighborhood: 'Almagro', amount: 12, description: 'Familias compraron carne premium juntas', type: 'deal_closed' },
    { id: '3', neighborhood: 'Villa Crespo', amount: 15, description: 'Kg de CO2 evitados hoy', type: 'impact' },
  ];

  const getIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'saving': return <TrendingUp className="text-[#00A650]" size={18} />;
      case 'deal_closed': return <Users className="text-[#009EE3]" size={18} />;
      case 'impact': return <Award className="text-orange-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-gray-800 tracking-tight flex items-center gap-2">
          <Shell className="text-[#009EE3]" size={20} />
          Pulso Barrial
        </h3>
        <span className="text-[10px] font-black uppercase text-[#009EE3] tracking-widest bg-blue-50 px-2 py-1 rounded-lg animate-pulse">
          En vivo
        </span>
      </div>

      <div className="grid gap-4">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-colors">
                {getIcon(achievement.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-[#009EE3] uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> {achievement.neighborhood}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-1">
                  {achievement.type === 'saving' && `$${achievement.amount.toLocaleString()} `}
                  {achievement.type === 'deal_closed' && `${achievement.amount} `}
                  {achievement.type === 'impact' && `${achievement.amount} `}
                  <span className="text-gray-500 font-medium">{achievement.description}</span>
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-[#009EE3] to-[#00A650] p-6 rounded-[2rem] text-white shadow-xl shadow-[#009EE3]/10 relative overflow-hidden">
        <div className="relative z-10 text-center">
            <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Ránking de Ahorro</div>
            <div className="text-2xl font-black tracking-tighter mb-1">#1 Caballito</div>
            <p className="text-[10px] font-bold opacity-70">¡El barrio más eficiente de la semana!</p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-20 rotate-12">
            <TrendingUp size={80} />
        </div>
      </div>
    </div>
  );
}
