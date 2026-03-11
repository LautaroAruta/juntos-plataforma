import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#00AEEF] font-bold text-sm uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mb-12">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none text-gray-600 font-medium space-y-6">
          <p>En JUNTOS, nos tomamos muy en serio tu privacidad. Estos son los datos que recolectamos...</p>
          <h2 className="text-xl font-bold text-gray-800 mt-8">1. Datos recolectados</h2>
          <p>Recopilamos información básica para procesar tus compras y envíos.</p>
          <h2 className="text-xl font-bold text-gray-800 mt-8">2. Seguridad</h2>
          <p>Tus datos están protegidos con los más altos estándares de seguridad y cifrado.</p>
        </div>
      </div>
    </div>
  );
}
