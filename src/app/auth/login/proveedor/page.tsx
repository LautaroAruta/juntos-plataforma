// This is the Provider Login Page
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, Loader2, ChevronLeft } from "lucide-react";

export default function ProviderLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Credenciales inválidas. Por favor intenta de nuevo.");
      } else {
        // We push to root because middleware/home page handles internal rol-based redirection 
        // Admin goes to /admin/dashboard and Provider (if manual redirect added) to /provider/dashboard
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 relative">
        <Link href="/auth/login" className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-white mb-4 shadow-lg shadow-slate-800/30">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Portal Comercios</h1>
          <p className="text-slate-500 text-sm font-medium">Gestión para Proveedores JUNTOS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Email Profesional
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-slate-800/5 focus:border-slate-800 transition-all font-medium"
                placeholder="ventas@tuempresa.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">
              Contraseña Segura
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-slate-800/5 focus:border-slate-800 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right mt-2">
              <Link href="/auth/recuperar" className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase tracking-tight transition-colors">
                Recuperar Contraseña
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-4 rounded-xl border border-red-100 font-bold animate-shake">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-800/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm mt-4 active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "ENTRAR AL PANEL"}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">
            ¿Querés vender en JUNTOS?{" "}
            <Link href="/auth/registro/proveedor" className="text-slate-800 font-black hover:underline uppercase block mt-2">
              Registrar Negocio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
