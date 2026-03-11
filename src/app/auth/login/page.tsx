// Selection Portal inside /auth/login
import Link from "next/link";
import { User, Store, ArrowRight } from "lucide-react";

export default function LoginSelectionPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Ingresar a JUNTOS</h1>
          <p className="text-slate-500 font-medium">Seleccioná cómo querés entrar a la plataforma</p>
        </div>

        <div className="space-y-4">
          <Link 
            href="/auth/login/cliente" 
            className="w-full bg-white border-2 border-slate-100 hover:border-[#00AEEF] hover:shadow-xl hover:shadow-[#00AEEF]/10 rounded-[2rem] p-6 flex items-center justify-between text-left transition-all group active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#E8F7FF] rounded-2xl flex items-center justify-center text-[#00AEEF] group-hover:scale-110 transition-transform">
                <User size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Soy Cliente</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Quiero comprar en ofertas grupales</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-[#00AEEF] group-hover:translate-x-1 transition-all" />
          </Link>

          <Link 
            href="/auth/login/proveedor" 
            className="w-full bg-white border-2 border-slate-100 hover:border-slate-800 hover:shadow-xl hover:shadow-slate-800/10 rounded-[2rem] p-6 flex items-center justify-between text-left transition-all group active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-800 group-hover:bg-slate-800 group-hover:text-white transition-all">
                <Store size={28} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">Soy Proveedor</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Quiero gestionar mis ventas e inventario</p>
              </div>
            </div>
            <ArrowRight className="text-slate-300 group-hover:text-slate-800 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
        
        <div className="mt-12 text-slate-400 text-xs font-semibold">
           <Link href="/" className="hover:text-slate-700 hover:underline inline-flex items-center gap-1">
             Volver al inicio
           </Link>
        </div>
      </div>
    </div>
  );
}
