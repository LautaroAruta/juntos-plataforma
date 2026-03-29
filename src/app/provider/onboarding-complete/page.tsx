"use client";

import Link from "next/link";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";

export default function OnboardingComplete() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-[#009EE3]/10 text-center border border-slate-50">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-50 text-green-500 mb-6 border-4 border-green-100 ring-8 ring-green-50/50">
          <CheckCircle size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">¡Registro Exitoso!</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Tu perfil de proveedor ha sido creado. Para poder recibir pagos y activar tus ventas, el último paso es vincular tu cuenta.
        </p>

        <div className="space-y-4 mb-8">
          <Link 
            href="/api/provider/mp-connect"
            className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
          >
            Vincular Mercado Pago
          </Link>
          
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Validación pendiente</h4>
              <p className="text-slate-500 text-xs mt-1">
                Nuestro equipo revisará tu información. Te enviaremos un email cuando tu cuenta sea aprobada.
              </p>
            </div>
          </div>
        </div>

        <Link 
          href="/"
          className="text-slate-400 hover:text-slate-600 font-bold text-sm transition-colors"
        >
          Omitir por ahora y volver al inicio
        </Link>
      </div>
    </div>
  );
}
