"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, Phone, MapPin, Loader2, ArrowRight } from "lucide-react";

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
        body: JSON.stringify(formData),
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
    <div className="min-h-[calc(100vh-64px)] py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg glass-card rounded-3xl p-8 lg:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FFF8E7] text-[#009EE3] mb-4">
            <UserPlus size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-800">Crea tu cuenta</h1>
          <p className="text-slate-500">Únete a BANDHA y empezá a ahorrar hoy.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Nombre</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="Juan"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Apellido</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="tel"
                name="telefono"
                required
                value={formData.telefono}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="+54 11 ..."
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                name="direccion"
                required
                value={formData.direccion}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#009EE3]/20 focus:border-[#009EE3]"
                placeholder="Calle 123, Ciudad"
              />
            </div>
          </div>

          {error && (
            <div className="md:col-span-2 bg-red-50 text-red-500 text-xs p-4 rounded-xl border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#009EE3] to-[#00A650] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#009EE3]/20 transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Crear Cuenta <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/auth/login" className="text-[#009EE3] font-bold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
