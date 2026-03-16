import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-[#009EE3] font-bold text-sm uppercase tracking-widest mb-12">
          <ArrowLeft size={16} /> Volver
        </Link>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter uppercase mb-12">Política de Privacidad</h1>
        <div className="prose prose-slate max-w-none text-gray-600 font-medium space-y-6">
          <p>
            En <strong>BANDHA</strong>, operado por Bandha Plataforma SA (en formación), nos tomamos muy en serio la protección de tus datos personales. 
            Esta política cumple con la Ley 25.326 de Protección de Datos Personales de la República Argentina.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">1. Datos que recolectamos</h2>
          <p>
            Para que la plataforma funcione, recolectamos:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Identificación</strong>: Nombre, apellido y DNI (opcional para facturación).</li>
            <li><strong>Contacto</strong>: Email y número de teléfono para coordinar retiros.</li>
            <li><strong>Logística</strong>: Tu barrio o zona de interés para mostrarte ofertas cercanas.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-8">2. Uso de la Información</h2>
          <p>
            Tus datos se utilizan exclusivamente para:
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li>Procesar tus compras grupales y gestionar los pagos vía Mercado Pago.</li>
            <li>Generar tu código QR único de retiro.</li>
            <li>Notificarte cuando un grupo se completa o cuando tenés crédito disponible.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-800 mt-8">3. Terceros</h2>
          <p>
            No vendemos tus datos. Compartimos tu nombre con el <strong>proveedor</strong> del producto recién cuando la oferta se completa, 
            únicamente para que pueda verificar tu identidad al momento de la entrega. Los pagos son procesados de forma segura por Mercado Pago.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">4. Tus Derechos</h2>
          <p>
            Podés solicitar el acceso, rectificación o supresión de tus datos en cualquier momento enviando un correo a 
            <a href="mailto:privacidad@bandha.com.ar" className="text-[#00AEEF]"> privacidad@bandha.com.ar</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
