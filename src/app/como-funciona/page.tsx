import React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Users, ShoppingBag, Truck } from "lucide-react";

export default function ComoFuncionaPage() {
  const steps = [
    {
      title: "Elegí tu oferta",
      description: "Navegá por el marketplace y encontrá el producto que necesitás entre cientos de ofertas grupales activas.",
      icon: <ShoppingBag className="text-[#00AEEF]" size={32} />,
      color: "bg-[#E8F7FF]"
    },
    {
      title: "Unite al grupo",
      description: "Sumate a otros compradores. No pagás nada hasta que se complete el grupo. Cuantos más somos, más ahorramos.",
      icon: <Users className="text-[#0077CC]" size={32} />,
      color: "bg-blue-50"
    },
    {
      title: "Recibilo en tu casa",
      description: "Una vez que el grupo llega al mínimo de participantes, el proveedor procesa el envío y lo recibís en la puerta de tu casa.",
      icon: <Truck className="text-gray-800" size={32} />,
      color: "bg-gray-100"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="bg-white border-b border-gray-100 mb-12">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#00AEEF] font-bold text-sm uppercase tracking-widest mb-8 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-gray-800 tracking-tighter uppercase mb-6">
            ¿Cómo funciona <span className="text-[#00AEEF]">JUNTOS</span>?
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            Nuestra plataforma conecta personas para comprar por volumen directamente a fabricantes y distribuidores.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-gray-200 transition-all">
              <div className={`w-20 h-20 ${step.color} rounded-[2rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-800 tracking-tight mb-4">{i + 1}. {step.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gray-800 rounded-[3rem] p-12 md:p-16 text-white overflow-hidden relative">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-6">¿Tenés una empresa?</h2>
            <p className="text-gray-400 text-lg mb-8">
              Vendé tus productos a gran escala y simplificá tu logística. Unirte como proveedor es gratis.
            </p>
            <Link 
              href="/auth/login" 
              className="inline-flex items-center gap-2 bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-[#00AEEF]/20 transition-all uppercase tracking-tight"
            >
              Registrar mi negocio
            </Link>
          </div>
          <div className="absolute right-[-10%] bottom-[-20%] text-[20rem] font-black text-white/5 select-none hidden lg:block">
            JUNTOS
          </div>
        </div>
      </div>
    </div>
  );
}
