import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#009EE3] font-bold text-sm uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mb-12">Términos y Condiciones</h1>
        <div className="prose prose-slate max-w-none text-gray-600 font-medium space-y-6">
          <p>Bienvenido a BANDHA. Al utilizar nuestra plataforma, aceptas los siguientes términos...</p>
          <h2 className="text-xl font-bold text-gray-800 mt-8">1. Uso del Servicio</h2>
          <p>BANDHA es un marketplace que facilita la compra grupal entre usuarios y proveedores.</p>
          <h2 className="text-xl font-bold text-gray-800 mt-8">2. Compras Grupales</h2>
          <p>Las compras solo se procesan si se alcanza el quórum mínimo dentro del tiempo establecido.</p>
          {/* Aditional placeholders */}
        </div>
      </div>
    </div>
  );
}
