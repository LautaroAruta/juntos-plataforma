import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, HelpCircle } from "lucide-react";

export default function FAQsPage() {
  const faqs = [
    {
      q: "¿Qué es BANDHA?",
      a: "BANDHA es una plataforma de compra grupal que permite a los usuarios unirse para comprar productos a precios mayoristas directamente de proveedores."
    },
    {
      q: "¿Cómo se activa una oferta?",
      a: "Una oferta se activa cuando alcanzamos el número mínimo de participantes (el 'quórum') definido por el proveedor."
    },
    {
      q: "¿Qué pasa si no se completa el grupo?",
      a: "Si el tiempo de la oferta expira y no se alcanzó el mínimo, la oferta se cancela y no se realiza ningún cargo en tu tarjeta."
    },
    {
      q: "¿Cómo recibo mi producto?",
      a: "Una vez completado el grupo, coordinas el retiro directamente con el proveedor en su local o punto de entrega en el barrio. No más esperas interminables de fletes externos."
    },
    {
      q: "¿Los productos tienen garantía?",
      a: "Sí, todos los productos vendidos en BANDHA tienen garantía oficial del fabricante o del proveedor, igual que en cualquier tienda oficial."
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      <div className="bg-white border-b border-gray-100 mb-12">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-[#009EE3] font-bold text-sm uppercase tracking-widest mb-8 hover:gap-3 transition-all">
            <ArrowLeft size={16} /> Volver al Inicio
          </Link>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#FFF8E7] rounded-2xl text-[#009EE3]">
              <HelpCircle size={48} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 tracking-tighter uppercase mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">
            Todo lo que necesitás saber para empezar a ahorrar comprando en grupo.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 group">
              <h3 className="text-xl font-black text-gray-800 tracking-tight mb-4 flex justify-between items-center group-hover:text-[#009EE3] transition-colors">
                {faq.q}
              </h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-400 font-medium mb-6">¿Tenés otra duda?</p>
          <Link 
            href="#" 
            className="text-[#009EE3] font-black uppercase tracking-widest hover:text-[#00A650] transition-colors border-b-2 border-[#009EE3]/20 pb-1"
          >
            Contactanos por WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}
