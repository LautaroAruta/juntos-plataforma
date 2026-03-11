"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Mail, ChevronLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react";

export default function RecuperarPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      setSuccess(true);
    } catch (err: any) {
      setError("Ocurrió un error. Verificá tu email e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-[#E8F7FF]/30">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#00AEEF]/5">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors text-xs uppercase tracking-widest">
          <ChevronLeft size={16} /> Volver
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E8F7FF] text-[#00AEEF] mb-6 shadow-inner">
            <KeyRound size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">Recuperar</h1>
          <p className="text-slate-500 font-medium italic">Te enviaremos un link para resetear tu contraseña.</p>
        </div>

        {success ? (
          <div className="bg-green-50 rounded-3xl p-6 border border-green-100 text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-green-500 mb-4 shadow-sm">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-bold text-green-700">¡Email enviado!</p>
            <p className="text-xs text-green-600/80 mt-2">Si el email existe en nuestra base, recibirás un link en los próximos minutos.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tu Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
                />
              </div>
              {error && <p className="text-red-500 text-[10px] mt-2 font-bold px-1">⚠️ {error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#00AEEF]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "ENVIAR RECOVERY LINK"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
