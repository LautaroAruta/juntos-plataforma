"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Building2, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText, 
  Tag, 
  ChevronLeft, 
  Loader2, 
  Clock,
  Briefcase
} from "lucide-react";

const CATEGORIES = [
  "Electrónica",
  "Ropa y calzado",
  "Alimentos",
  "Hogar y decoración",
  "Deportes",
  "Belleza y cuidado personal",
  "Juguetes",
  "Otros"
];

export default function RegisterProveedor() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nombreEmpresa: "",
    nombreContacto: session?.user?.name || "",
    email: session?.user?.email || "",
    password: "",
    telefono: "",
    cuit: "",
    categoria: "",
    descripcion: "",
  });

  const validateCUIT = (cuit: string) => {
    // Format XX-XXXXXXXX-X
    const cuitRegex = /^\d{2}-\d{8}-\d{1}$/;
    return cuitRegex.test(cuit);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateCUIT(formData.cuit)) {
      setError("Formato de CUIT inválido (Ej: 20-12345678-9).");
      return;
    }

    if (!session && formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!formData.categoria) {
      setError("Por favor selecciona una categoría.");
      return;
    }

    setLoading(true);

    try {
      const endpoint = session ? "/api/provider/onboarding" : "/api/auth/register-provider";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al registrarse");
      }

      if (session) {
        // Refrescar la sesión para que NextAuth vea que ahora somos proveedor
        await update({ rol: 'proveedor' });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 border border-slate-50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 text-[#00AEEF] mb-8">
            <Clock size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">¡Recibido!</h1>
          <p className="text-slate-500 font-medium mb-8">
            Tu cuenta de proveedor está configurada. Ahora podés empezar a cargar tus productos.
          </p>
          <Link href="/provider/dashboard" className="inline-block bg-[#00AEEF] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-[#00AEEF]/20 hover:bg-[#0077CC] transition-all uppercase tracking-widest text-sm">
            Ir a mi Panel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto">
      {!session && (
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al Login
        </Link>
      )}

      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">
          {session ? "Completar Perfil" : "Registro Proveedor"}
        </h1>
        <p className="text-slate-500 font-medium italic">Impulsá tu negocio con JUNTOS.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre de la Empresa</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                required
                placeholder="Empresa S.A."
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({...formData, nombreEmpresa: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Responsable del Negocio</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                required
                placeholder="Nombre y Apellido"
                value={formData.nombreContacto}
                onChange={(e) => setFormData({...formData, nombreContacto: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">CUIT</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="XX-XXXXXXXX-X"
                    value={formData.cuit}
                    onChange={(e) => setFormData({...formData, cuit: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all font-mono"
                  />
                </div>
             </div>
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Categoría</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <select
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all appearance-none"
                  >
                    <option value="">Seleccionar...</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
          {!session && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email Empresarial</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="email"
                  required={!session}
                  placeholder="ventas@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
                />
              </div>
            </div>
          )}

          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono de Contacto</label>
             <div className="relative">
               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
               <input
                 type="text"
                 required
                 placeholder="Ej: +54 9 11 ..."
                 value={formData.telefono}
                 onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                 className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all font-mono"
               />
             </div>
          </div>

          {!session && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input
                  type="password"
                  required={!session}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
           <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Descripción del Negocio (Opcional)</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-4 text-slate-300" size={18} />
                <textarea
                  placeholder="Contanos brevemente qué vendes..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-[#00AEEF]/5 focus:border-[#00AEEF] transition-all resize-none"
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
          className="w-full bg-slate-800 hover:bg-black text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-slate-800/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest active:scale-95 disabled:grayscale"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : "Finalizar Empresa"}
        </button>
      </form>
    </div>
  );
}

