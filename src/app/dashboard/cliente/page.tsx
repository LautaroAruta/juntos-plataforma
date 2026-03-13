import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShoppingBag, Users, Clock, Package, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

export default async function ClienteDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Si el usuario no es cliente (por ejemplo proveedor), redirigir
  if (session.user.rol !== "cliente") {
    // Si es proveedor, redirigir a su dashboard
    if (session.user.rol === "proveedor") {
      redirect("/provider/dashboard");
    } else if (session.user.rol === "admin") {
      redirect("/gestion-bandha");
    }
  }

  const supabase = await createClient();

  // Fetch user's participations (mocked data for now to ensure professional look)
  // In a real app we would query 'participants' or similar table
  const orders = [
    { id: "1", product: "Auriculares Galaxy Buds FE", status: "activo", participants: 4, min: 10, price: 59000, date: "Hoy" },
    { id: "2", product: "Zapatillas Urban Pro", status: "completado", participants: 15, min: 15, price: 42000, date: "Ayer" }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* User Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-[#009EE3] flex items-center justify-center overflow-hidden">
               {session.user.image ? (
                 <img src={session.user.image} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-black text-[#009EE3]">{session.user.name?.[0]}</span>
               )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-800 tracking-tighter uppercase">Hola, {session.user.name?.split(' ')[0]}</h1>
              <p className="text-gray-500 font-medium">Nivel Comprador BANDHA</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/perfil" className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
              <Settings size={18} /> Mi Perfil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Purchases */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-3">
                <ShoppingBag className="text-[#009EE3]" size={24} /> Mis Compras Grupales
              </h2>
            </div>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-50 flex flex-col md:flex-row items-center gap-6 md:gap-8 group hover:shadow-xl hover:shadow-gray-200 transition-all">
                  <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center text-gray-300">
                    <Package size={40} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-gray-800 mb-1">{order.product}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {order.date}</span>
                      <span className={`flex items-center gap-1.5 ${order.status === 'activo' ? 'text-blue-500' : 'text-green-500'}`}>
                        <div className={`w-2 h-2 rounded-full ${order.status === 'activo' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end gap-2">
                     <span className="text-2xl font-black text-gray-800">${order.price.toLocaleString()}</span>
                     <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${order.status === 'activo' ? 'from-[#009EE3] to-[#00A650]' : 'from-green-400 to-green-600'} rounded-full`}
                          style={{ width: `${(order.participants / order.min) * 100}%` }}
                        />
                     </div>
                     <span className="text-[10px] font-black text-gray-400">{order.participants}/{order.min} unidos</span>
                  </div>
                  <ChevronRight className="text-gray-300 hidden md:block" />
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Stats / Promos */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-[#009EE3] to-[#00A650] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#009EE3]/20">
               <h3 className="text-lg font-black uppercase tracking-tight mb-4">Ahorro Acumulado</h3>
               <div className="text-4xl font-black mb-2">$12.500</div>
               <p className="text-white/70 font-medium text-sm">Gracias a comprar en grupo este mes.</p>
               <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span>Próximo Rango</span>
                  <span>75%</span>
               </div>
               <div className="h-1.5 w-full bg-white/20 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-white w-3/4 rounded-full" />
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
               <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                 <Users size={16} className="text-[#009EE3]" /> Invitá Amigos
               </h3>
               <p className="text-gray-600 text-sm font-medium leading-relaxed mb-6">
                 Compartí BANDHA y recibí beneficios exclusivos en tu próxima compra grupal.
               </p>
               <button className="w-full py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-800 font-black text-sm uppercase tracking-tight transition-all">
                 Obtener mi link
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
