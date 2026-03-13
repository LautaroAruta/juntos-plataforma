// This is the Client Login Page
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Loader2, ChevronLeft } from "lucide-react";

export default function ClientLoginPage() {
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
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm glass-card rounded-3xl p-8 relative">
        <Link href="/auth/login" className="absolute top-6 left-6 text-slate-400 hover:text-slate-800 transition-colors">
          <ChevronLeft size={24} />
        </Link>
        <div className="text-center mb-8 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFF8E7] text-[#009EE3] mb-4">
            <LogIn size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Hola Cliente</h1>
          <p className="text-slate-500 text-sm">Ingresa para comprar y ahorrar bandha</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 px-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3] transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 px-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3] transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="text-right mt-1">
              <Link href="/auth/recuperar" className="text-[10px] font-bold text-[#009EE3] hover:underline uppercase tracking-tight">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-lg border border-red-100 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-4 rounded-xl shadow-lg shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "INGRESAR A MI CUENTA"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px]">
            <span className="bg-white px-3 text-slate-400 uppercase tracking-[0.2em] font-black">Tu forma rápida</span>
          </div>
        </div>

        <button
          onClick={() => signIn("google")}
          className="w-full bg-white border border-slate-200 text-slate-700 font-black py-4 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="Google" />
          ENTRAR RÁPIDO CON GOOGLE
        </button>

        <div className="mt-8 space-y-4 text-center">
          <p className="text-xs text-slate-500 font-medium">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/registro/cliente" className="text-[#009EE3] font-black hover:underline uppercase">
              Registrate Fácil
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
