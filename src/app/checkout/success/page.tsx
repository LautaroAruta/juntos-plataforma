"use client";

import Link from "next/link";
import { CheckCircle2, Package, ArrowRight, ArrowLeft } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center mt-[-3rem]">
        
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>
        
        <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-4">
          ¡Pago Exitoso!
        </h1>
        
        <p className="text-gray-600 text-base mb-8">
          Tu orden fue procesada correctamente a través de Mercado Pago. Te enviamos un comprobante y los detalles de envío a tu e-mail.
        </p>
        
        <div className="bg-gray-50 border rounded-lg p-6 mb-8 text-left">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-[#009EE3]" /> Preparando tu envío
          </h3>
          <p className="text-sm text-gray-500">
            Los proveedores de tu orden ya fueron notificados y están empacando tus productos.
            El tiempo estimado de entrega suele ser de 2 a 5 días hábiles.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <Link href="/dashboard" className="w-full h-12 inline-flex items-center justify-center rounded-md bg-[#009EE3] hover:bg-[#00A650] text-white font-bold text-base transition-colors gap-2">
            Ver mis Compras <ArrowRight className="w-4 h-4 hidden sm:block" />
          </Link>
          
          <Link href="/" className="w-full h-12 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-base transition-colors gap-2">
            <ArrowLeft className="w-4 h-4 hidden sm:block" /> Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
