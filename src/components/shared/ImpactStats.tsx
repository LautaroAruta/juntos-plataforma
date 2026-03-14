"use client";

import { motion } from "framer-motion";
import { Users, TrendingDown, MapPin, TreePine } from "lucide-react";

interface ImpactStatsProps {
  zone: string;
  totalSaved: number;
  activeUsers: number;
}

export default function ImpactStats({ zone, totalSaved, activeUsers }: ImpactStatsProps) {
  // Environmental "CO2" estimation based on local logistics vs far logistics
  const planetImpact = Math.floor(totalSaved / 500); 

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <MapPin size={18} fill="currentColor" className="opacity-20" />
            <span className="text-xs font-black uppercase tracking-widest">Impacto Barrial</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">En {zone}</h2>
        </div>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} 
                alt="vecino"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
            +{activeUsers}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Money Saved */}
        <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100">
          <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/20">
            <TrendingDown size={20} />
          </div>
          <p className="text-[10px] font-black text-emerald-700/50 uppercase tracking-widest mb-1">Ahorro Colectivo</p>
          <p className="text-2xl font-black text-emerald-900">${totalSaved.toLocaleString()}</p>
        </div>

        {/* Community Strength */}
        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
            <Users size={20} />
          </div>
          <p className="text-[10px] font-black text-indigo-700/50 uppercase tracking-widest mb-1">Vecinos Activos</p>
          <p className="text-2xl font-black text-indigo-900">{activeUsers} Vecinos</p>
        </div>

        {/* Eco Impact */}
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/20">
            <TreePine size={20} />
          </div>
          <p className="text-[10px] font-black text-blue-700/50 uppercase tracking-widest mb-1">Huella Reducida</p>
          <p className="text-2xl font-black text-blue-900">{planetImpact} Árboles eq.</p>
        </div>
      </div>

      {/* Progress to next neighborhood goal */}
      <div className="mt-8 pt-8 border-t border-slate-50">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Siguiente Meta: Descuento Extra en el Barrio</p>
            <p className="font-black text-slate-700">Meta: $25.000 de ahorro</p>
          </div>
          <p className="text-indigo-600 font-black">{Math.floor((totalSaved / 25000) * 100)}%</p>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(totalSaved / 25000) * 100}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
