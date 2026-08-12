"use client";

import Link from "next/link";
import { CheckCircle2, Clock, Shield } from "lucide-react";

export default function OnboardingComplete() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white">
      <div className="w-full max-w-2xl bg-white border-4 border-black p-12 shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4">
          <span className="text-[10px] font-black text-black/10 font-mono italic uppercase tracking-widest">
            TRANS_ID::SUCCESS_NODE_REACHED
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-32 h-32 border-4 border-black bg-[#00A650] text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-10 rotate-3 animate-in zoom-in duration-500">
            <CheckCircle2 size={64} strokeWidth={3} />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-black mb-6 tracking-tighter uppercase italic leading-none">
            REGISTRATION_VLD
          </h1>
          <p className="text-black/40 font-black text-xs uppercase tracking-[0.3em] mb-12 leading-relaxed max-w-md">
            SU PERFIL DE PROVEEDOR HA SIDO INICIALIZADO. PARA HABILITAR LIQUIDACIONES Y ACTIVAR EL NODO DE VENTAS, ES REQUERIDA LA VINCULACIÓN DE ACTIVOS.
          </p>

          <div className="w-full space-y-6 mb-12">
            <Link 
              href="/api/provider/mp-connect"
              className="w-full bg-[#FF5C00] hover:bg-black text-black hover:text-white border-4 border-black font-black py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center justify-center gap-4 text-2xl uppercase tracking-tighter italic group"
            >
              VINCULAR_MERCADO_PAGO // CONNECT
            </Link>
            
            <div className="bg-white border-4 border-black/[0.05] p-8 flex items-start gap-6 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,0.02)]">
              <div className="w-12 h-12 border-2 border-black bg-black text-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(255,165,0,1)]">
                <Clock size={24} strokeWidth={3} />
              </div>
              <div>
                <h4 className="font-black text-black text-sm uppercase italic tracking-tighter">VALIDATION_PIPELINE_ACTIVE</h4>
                <p className="text-black/40 text-[10px] font-black uppercase tracking-widest mt-2 leading-relaxed">
                  EL EQUIPO DE AUDITORÍA REVISARÁ SUS CREDENCIALES. SE NOTIFICARÁ VÍA TRANSMISIÓN EMAIL TRAS LA APROBACIÓN DEL SISTEMA.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link 
              href="/"
              className="text-black hover:text-[#FF5C00] font-black text-[10px] uppercase tracking-[0.4em] transition-colors italic border-b-2 border-transparent hover:border-[#FF5C00] pb-1"
            >
              SKIP_DEPLOYMENT // RETURN_HOME
            </Link>
            
            <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-black/20 uppercase tracking-[0.5em] font-mono italic">
              <Shield size={14} strokeWidth={3} /> SECURITY_LEVEL_STABLE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
