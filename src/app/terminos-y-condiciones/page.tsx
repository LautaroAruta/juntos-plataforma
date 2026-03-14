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
          <p>
            Bienvenido a <strong>BANDHA</strong>. Al utilizar nuestra plataforma, aceptás los siguientes términos que rigen la relación entre los usuarios compradores, 
            los proveedores y la plataforma.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">1. Naturaleza del Servicio</h2>
          <p>
            BANDHA es un punto de encuentro que facilita la <strong>compra colaborativa</strong>. La plataforma no vende productos directamente, 
            sino que conecta a un grupo de personas interesadas en un mismo producto para obtener un precio mayorista de un proveedor verificado.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">2. Ofertas Grupales (Quórum)</h2>
          <p>
            Las compras son <strong>condicionales</strong>. La transacción solo se perfecciona si se alcanza el número mínimo de compradores 
            antes de la fecha de vencimiento. Si no se alcanza, Mercado Pago reembolsará automáticamente el 100% de tu dinero.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">3. Retiro de Productos</h2>
          <p>
            Al comprar, aceptás retirar el producto en el <strong>Punto de Retiro</strong> seleccionado dentro de los horarios establecidos por el proveedor. 
            Debés presentar tu código QR y DNI para validar la entrega.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">4. Reembolsos y Cancelaciones</h2>
          <p>
            Debido a la naturaleza de las compras grupales, una vez que el grupo se completa, no se aceptan cancelaciones individuales ya que 
            esto perjudicaría el precio obtenido por el resto de los compradores. Se aplican las garantías legales vigentes en Argentina.
          </p>

          <h2 className="text-xl font-bold text-gray-800 mt-8">5. Responsabilidad</h2>
          <p>
            BANDHA garantiza la transparencia del proceso y el manejo seguro de los fondos, pero la calidad final del producto es responsabilidad 
            directa del proveedor identificado en la oferta.
          </p>
        </div>
      </div>
    </div>
  );
}
