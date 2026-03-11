"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Phone, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function CompletarPerfil() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [telefono, setTelefono] = useState("+54 9 ");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    // @ts-ignore
    if (session?.user?.perfilCompleto) {
      router.push("/");
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!telefono.startsWith("+54 9") || telefono.length < 13) {
      setError("Formato de teléfono inválido (Ej: +54 9 11 1234-5678).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono }),
      });

      if (!res.ok) throw new Error("Error al actualizar perfil");

      setSuccess(true);
      // Update session to reflect completion
      await update();
      
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-20 text-center uppercase font-black text-slate-300">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#E8F7FF] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl shadow-[#00AEEF]/10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#E8F7FF] text-[#00AEEF] mb-6">
            <Phone size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase mb-2">¡Hola {session?.user?.name?.split(" ")[0]}!</h1>
          <p className="text-slate-500 font-medium italic">Falta solo un detalle: necesitamos tu WhatsApp para coordinar los retiros.</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-500 mb-4 animate-bounce">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-green-600 font-black uppercase tracking-widest text-sm">Perfil Completado</p>
            <p className="text-slate-400 text-xs mt-2">Redirigiendo...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tu Teléfono (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="+54 9 11 1234-5678"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all font-mono"
                />
              </div>
              {error && <p className="text-red-500 text-[10px] mt-2 font-bold px-1">⚠️ {error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#00AEEF]/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "FINALIZAR"}
            </button>

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="w-full flex items-center justify-center gap-2 text-slate-300 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut size={14} /> Salir y cambiar de cuenta
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
