"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin, ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterCliente() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombreCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "+54 9 ",
    direccion: "",
  });

  const validatePhone = (phone: string) => {
    // Basic Argentine phone format: +54 9 11 XXXX-XXXX or similar
    // We'll be flexible but check for the +54 9 prefix
    return phone.startsWith("+54 9") && phone.length >= 13;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      setError("La contraseña debe tener al menos 8 caracteres y un número.");
      return;
    }

    if (!validatePhone(formData.telefono)) {
      setError("Formato de teléfono inválido (Ej: +54 9 11 1234-5678).");
      return;
    }

    setLoading(true);

    try {
      // Split name into nombre and apellido for the DB
      const names = formData.nombreCompleto.trim().split(" ");
      const nombre = names[0];
      const apellido = names.slice(1).join(" ") || " ";

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre,
          apellido,
          telefono: formData.telefono,
          direccion: formData.direccion,
          rol: "cliente"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      setSuccess(true);
      // Wait a bit before redirecting or show check email page
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#00AEEF]/10 border border-slate-50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">¡Casi listo!</h1>
          <p className="text-slate-500 font-medium mb-8">
            Enviamos un link de verificación a <span className="font-bold text-slate-800">{formData.email}</span>. 
            Por favor, revisá tu casilla (y la carpeta de spam).
          </p>
          <Link href="/auth/login" className="inline-block bg-[#00AEEF] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-[#00AEEF]/20 hover:bg-[#0077CC] transition-all uppercase tracking-widest text-sm">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al Login
      </Link>

      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">Crear Cuenta</h1>
        <p className="text-slate-500 font-medium italic">Unite a JUNTOS y empezá a ahorrar.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                required
                placeholder="Juan Pérez"
                value={formData.nombreCompleto}
                onChange={(e) => setFormData({...formData, nombreCompleto: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="email"
                required
                placeholder="juan@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono (WhatsApp)</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                required
                placeholder="+54 9 11 1234-5678"
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all font-mono"
              />
            </div>
          </div>

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Dirección (Opcional)</label>
             <div className="relative">
               <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input
                 type="text"
                 placeholder="Calle 123, CABA"
                 value={formData.direccion}
                 onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
               />
             </div>
          </div>
        </div>

        <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="password"
                required
                placeholder="Mínimo 8 caracteres y 1 número"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Confirmar Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="password"
                required
                placeholder="Repetí tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-shake">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00AEEF] hover:bg-[#0077CC] text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-[#00AEEF]/30 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest active:scale-95 disabled:grayscale"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Crear mi cuenta"}
        </button>
      </form>
    </div>
  );
}
