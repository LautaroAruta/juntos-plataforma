'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle, 
  BarChart3, 
  PieChart, 
  ArrowUpRight, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  successRate: number;
  activeRevenue: number;
  history: { name: string; revenue: number }[];
  topProducts: { name: string; count: number }[];
  activeDealsCount: number;
}

export default function ProviderAnalytics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/provider/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-bandha-bg flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-bandha-primary/30 border-t-bandha-primary rounded-full animate-spin" />
    </div>
  );

  if (!stats) return <div>Error loading stats</div>;

  return (
    <div className="min-h-screen bg-white pb-24 text-black">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-black pb-10 mb-16">
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black text-black tracking-[-0.05em] uppercase leading-none italic">
              PERF_METRICS
            </h1>
            <p className="text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] pl-1">
              ANÁLISIS ESTRATÉGICO DE OPERACIONES // v1.2.0
            </p>
          </div>
          <div className="flex gap-4">
             <button className="px-8 py-4 bg-black text-white text-[10px] font-black uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Últimos 6 Meses</button>
             <button className="px-8 py-4 bg-white text-black text-[10px] font-black uppercase border-2 border-black hover:bg-black hover:text-white transition-all italic">Todo el año</button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <StatCard 
            title="TOTAL_REVENUE" 
            value={`$${(stats.totalRevenue || 0).toLocaleString()}`} 
            icon={<DollarSign className="text-black" strokeWidth={3} />} 
            trend="+12% VS_LAST_PERIOD"
            color="orange"
          />
          <StatCard 
            title="TOTAL_ORDERS" 
            value={stats.totalOrders} 
            icon={<ShoppingBag className="text-black" strokeWidth={3} />} 
            trend={`${stats.activeDealsCount} ACTIVE_DEALS`}
            color="black"
          />
          <StatCard 
            title="SUCCESS_RATE" 
            value={`${stats.successRate}%`} 
            icon={<CheckCircle className="text-black" strokeWidth={3} />} 
            trend="GROUPS_COMPLETED"
            color="orange"
          />
          <StatCard 
            title="ACTIVE_EQUITY" 
            value={`$${(stats.activeRevenue || 0).toLocaleString()}`} 
            icon={<Clock className="text-black" strokeWidth={3} />} 
            trend="EXPECTED_CLOSE_VALUE"
            color="black"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* REVENUE CHART */}
          <div className="lg:col-span-2 bg-white border-4 border-black p-10 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-12 border-b-2 border-black pb-6">
               <h3 className="text-2xl font-black text-black tracking-tighter uppercase italic">REVENUE_FLOW_LOG</h3>
               <div className="flex items-center gap-2 text-[10px] font-black text-black bg-[#FF5C00] border-2 border-black px-4 py-1 uppercase tracking-widest italic">
                  <TrendingUp size={14} strokeWidth={3} /> GROWING_DATA
               </div>
            </div>
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.history}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5C00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FF5C00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#000', strokeWidth: 2 }} 
                    tickLine={false} 
                    tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }}
                  />
                  <YAxis 
                    axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    tickLine={false}
                    tick={{ fill: '#000', fontSize: 10, fontWeight: 900 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '0', border: '2px solid black', backgroundColor: 'white', boxShadow: '8px 8px 0px 0 black', fontWeight: '900' }}
                  />
                  <Area 
                    type="stepAfter" 
                    dataKey="revenue" 
                    stroke="#FF5C00" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TOP PRODUCTS */}
          <div className="bg-black text-white border-4 border-black p-10 shadow-[16px_16px_0px_0px_rgba(255,92,0,1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,92,0,0.05),transparent)]" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12 border-b-2 border-white/20 pb-6">
                 <BarChart3 size={32} className="text-[#FF5C00]" strokeWidth={3} />
                 <h3 className="text-2xl font-black tracking-tight uppercase italic">HIGH_DEMAND_SKUs</h3>
              </div>
              
              <div className="space-y-10">
                {(stats.topProducts || []).length > 0 ? (stats.topProducts.map((p, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex justify-between items-end border-l-2 border-[#FF5C00] pl-4">
                       <span className="text-[10px] font-black text-white/50 uppercase tracking-widest truncate pr-4">{p.name}</span>
                       <span className="text-xs font-black text-[#FF5C00] tracking-widest">{p.count} UNITs</span>
                    </div>
                    <div className="h-4 w-full bg-white/5 border border-white/10 overflow-hidden shadow-inner">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.count / Math.max(1, ...stats.topProducts.map(x => x.count))) * 100}%` }}
                        className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.2)]" 
                       />
                    </div>
                  </div>
                ))) : (
                  <div className="text-white/30 text-[10px] font-black py-20 text-center border-2 border-dashed border-white/10 italic">
                    ZERO_TRANSACTION_HISTORY
                  </div>
                )}
              </div>

              <button className="w-full mt-16 py-6 bg-white text-black border-2 border-black text-xs font-black uppercase tracking-[0.2em] shadow-[8px_8px_0px_0px_rgba(255,92,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all active:scale-95 italic">
                DOWNLOAD_RAW_REPORT_CSV
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="bg-white p-8 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative group overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rotate-45 opacity-10 ${color === 'orange' ? 'bg-[#FF5C00]' : 'bg-black'}`} />
      <div className="flex justify-between items-start mb-10">
        <div className={`w-14 h-14 border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color === 'orange' ? 'bg-[#FF5C00]' : 'bg-white'}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div className="flex items-center gap-1 text-[9px] font-black text-black bg-[#FF5C00] border-2 border-black px-3 py-1 uppercase tracking-widest italic animate-pulse">
           LIVE_FEED
        </div>
      </div>
      <p className="text-[10px] font-black text-black/30 uppercase tracking-[0.3em] mb-2 pl-1 italic">{title}</p>
      <h4 className="text-4xl font-black text-black tracking-tighter mb-4 italic leading-none">{value}</h4>
      <p className="text-[10px] font-black text-[#FF5C00] uppercase tracking-widest italic flex items-center gap-2">
          <ArrowUpRight size={14} strokeWidth={3} /> {trend}
      </p>
    </div>
  );
}
