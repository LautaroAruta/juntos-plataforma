"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Mail, Lock, User, Phone, MapPin, Loader2, ArrowRight, Gift } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    telefono: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || (typeof window !== 'undefined' ? localStorage.getItem("bandha_ref") : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Here we would call an API route to register the user in Supabase Auth
    // and then sign them in. 
    // Since manual registration via NextAuth requires a custom API route for the signup part:
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al registrarse.");
      } else {
        // Success -> Sign in
        await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: true,
          callbackUrl: "/",
        });
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 flex items-center justify-center bg-brand-warm">
      <div className="w-full max-w-2xl bg-white boutique-card p-10 lg:p-16 relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-stone/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        
        <div className="text-center mb-12 relative z-10">
          <Link href="/" className="inline-block text-4xl font-black font-serif text-brand-charcoal tracking-tighter mb-8 hover:text-brand-camel transition-colors">
            BANDHA
          </Link>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-camel block">Unirse a la comunidad</span>
            <h1 className="text-4xl font-black font-serif text-brand-charcoal tracking-tighter">Crear Cuenta</h1>
            <p className="text-slate-500 font-medium text-sm">Empezá a ahorrar conectando con tus vecinos.</p>
          </div>
          
          {referralCode && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-sage/5 text-brand-sage rounded-full border border-brand-sage/10">
              <Gift size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">¡Referido con éxito!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="Ej: Juan"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Apellido</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="Ej: Pérez"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="tel"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="Ej: +54 11 ..."
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input
                type="text"
                name="direccion"
                required
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-stone-50 border border-stone-100 rounded-xl py-3.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel text-brand-charcoal placeholder:text-slate-300 transition-all font-medium"
                placeholder="Calle 123, Barrio"
              />
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 bg-red-50 text-red-600 text-[10px] p-4 rounded-xl border border-red-100 font-bold uppercase tracking-widest text-center mt-2">
              {error}
            </div>
          )}

          <div className="md:col-span-2 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-boutique h-14 rounded-xl flex items-center justify-center gap-3 group text-xs transition-all active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Comenzar Experiencia BANDHA <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-14 text-center border-t border-stone-100 pt-10 relative z-10">
          <p className="text-xs font-semibold text-slate-500">
            ¿Ya eres parte de BANDHA?{" "}
            <Link href="/auth/login" className="text-brand-charcoal font-black border-b border-brand-camel hover:text-brand-camel transition-colors ml-1">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
