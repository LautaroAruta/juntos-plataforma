"use client";

import { BarChart3, TrendingUp, PieChart, Info, HelpCircle, ArrowUpRight, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

interface InsightCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

function InsightCard({ title, value, change, isPositive, icon }: InsightCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
          {icon}
        </div>
        <div className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter ${
          isPositive ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
        }`}>
          {isPositive ? '↑' : '↓'} {change}
        </div>
      </div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</div>
      <div className="text-2xl font-black text-gray-800 tracking-tighter">{value}</div>
    </div>
  );
}

export default function NeighborhoodInsights({ neighborhoodId }: { neighborhoodId: string }) {
  // Mock data for the "Advanced Analytics" feel
  // In a real scenario, this would come from a complex Supabase query
  const savingsHistory = [45000, 62000, 58000, 89000, 110000, 95000];
  const maxSavings = Math.max(...savingsHistory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
            <BarChart3 className="text-[#009EE3]" size={24} /> Inteligencia de {neighborhoodId}
          </h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Perspectivas avanzadas del consumo colectivo
          </p>
        </div>
        <button className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors">
          <HelpCircle size={16} />
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard 
          title="Ahorro del Mes" 
          value="$125.400" 
          change="12%" 
          isPositive={true}
          icon={<TrendingUp size={20} />}
        />
        <InsightCard 
          title="Volumen de Compra" 
          value="1.2 tn" 
          change="8%" 
          isPositive={true}
          icon={<ShoppingBag size={20} />}
        />
        <InsightCard 
          title="Eficiencia de Deals" 
          value="94%" 
          change="2%" 
          isPositive={true}
          icon={<PieChart size={20} />}
        />
      </div>

      {/* CHART SECTION: SAVINGS TREND */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <BarChart3 size={120} className="text-gray-800" />
        </div>
        
        <div className="relative z-10">
          <div className="mb-8">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight mb-1">Tendencia de Ahorro Colectivo</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">Últimos 6 meses de actividad barrial</p>
          </div>

          {/* Simple SVG Chart Wrapper */}
          <div className="h-48 w-full flex items-end gap-2 px-2">
            {savingsHistory.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div className="relative w-full flex flex-col items-center">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxSavings) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 1, ease: "easeOut" }}
                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 group-hover:brightness-110 ${
                      i === savingsHistory.length - 1 ? 'bg-[#009EE3] shadow-lg shadow-blue-100' : 'bg-gray-100'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    ${val.toLocaleString()}
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Mes {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PREDICTIVE INSIGHT */}
      <div className="bg-gradient-to-br from-[#009EE3] to-[#00A650] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
        <div className="absolute top-0 right-0 p-4">
          <motion.div
            animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <TrendingUp size={48} className="opacity-20" />
          </motion.div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Info size={16} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Predicción de Demanda</span>
          </div>
          <h3 className="text-xl font-black tracking-tight mb-2">Semana del Aceite y Harina</h3>
          <p className="text-sm font-medium text-white/90 leading-relaxed max-w-sm">
            Según el patrón de consumo de {neighborhoodId}, la próxima semana habrá una alta demanda de básicos. 
            <span className="font-black text-white"> ¡Se estima un ahorro extra del 15%</span> si nos coordinamos hoy!
          </p>
          
          <button className="mt-6 bg-white text-[#009EE3] font-black text-[10px] px-6 py-3 rounded-full uppercase tracking-widest shadow-lg hover:scale-105 transition-all active:scale-95 flex items-center gap-2">
            Ver Deals Programados <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
