"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin, ChevronLeft, Loader2, CheckCircle2, RefreshCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { motion, AnimatePresence } from "framer-motion";

function RegisterClienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");
  
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    fecha_nacimiento: "",
    documento_tipo: "DNI",
    documento_numero: "",
    email: "",
    telefono: "+54 9 ",
    otp: "",
    password: "",
    confirmPassword: "",
    isVerified: false,
  });

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.nombre || !formData.apellido) return "Nombre y Apellido son requeridos.";
      if (!formData.fecha_nacimiento) return "Fecha de nacimiento es requerida.";
      if (!formData.documento_numero) return "Número de documento es requerido.";
    }
    if (step === 2) {
      if (!formData.email) return "Email es requerido.";
      if (!formData.telefono.startsWith("+54 9") || formData.telefono.length < 13) return "Formato de teléfono inválido.";
    }
    if (step === 3) {
      if (!formData.isVerified) return "Debes verificar tu email con el código de 6 dígitos.";
    }
    return "";
  };

  const nextStep = async () => {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }

    if (step === 2) {
      // Al pasar de contacto a verificación, mandamos el OTP
      await triggerOTP();
    }

    if (step < 4) setStep(step + 1);
  };

  const triggerOTP = async () => {
    setLoading(true);
    setError("");
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: true, // Esto crea el usuario en auth.users si no existe
        }
      });
      if (otpError) throw otpError;
    } catch (err: any) {
      setError("Error al enviar el código: " + err.message);
      // No avanzamos de paso si falla el envío? 
      // En realidad para debug/experiencia mejor dejarlo pero avisar.
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      // EN DESARROLLO: Aceptar cualquier código de 6 dígitos para no trabar la demo
      if (process.env.NODE_ENV === 'development') {
        console.log("Modo Test: Aceptando código", formData.otp);
        setFormData(prev => ({ ...prev, isVerified: true }));
        setStep(4);
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email,
        token: formData.otp,
        type: 'signup'
      });
      
      if (verifyError) {
        // Intentar con type 'signin' por si ya existía el registro en auth.users
        const { error: retryError } = await supabase.auth.verifyOtp({
          email: formData.email,
          token: formData.otp,
          type: 'email'
        });
        if (retryError) throw retryError;
      }

      setFormData(prev => ({ ...prev, isVerified: true }));
      setStep(4);
    } catch (err: any) {
      setError("Código inválido o expirado. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }

    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (formData.password.length < 8 || !/\d/.test(formData.password)) {
      setError("La contraseña debe tener al menos 8 caracteres y un número.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nombre: formData.nombre,
          apellido: formData.apellido,
          telefono: formData.telefono,
          fecha_nacimiento: formData.fecha_nacimiento,
          documento_tipo: formData.documento_tipo,
          documento_numero: formData.documento_numero,
          rol: "cliente",
          referralCode: referralCode,
          registration_step: 4
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al registrarse");
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
        <div className="max-w-md bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#009EE3]/10 border border-slate-50">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">¡Casi listo!</h1>
          <p className="text-slate-500 font-medium mb-8">
            Enviamos un link de verificación a <span className="font-bold text-slate-800">{formData.email}</span>. 
            Por favor, revisá tu casilla.
          </p>
          <Link href="/auth/login" className="inline-block bg-[#009EE3] text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-[#009EE3]/20 hover:bg-[#00A650] transition-all uppercase tracking-widest text-sm">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: "Identidad", icon: User },
    { id: 2, title: "Contacto", icon: Mail },
    { id: 3, title: "Verificar", icon: CheckCircle2 },
    { id: 4, title: "Seguridad", icon: Lock },
  ];

  return (
    <div className="pb-24 px-4 pt-8 max-w-lg mx-auto">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold mb-8 transition-colors group">
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Volver al Login
      </Link>

      <div className="mb-10 text-center">
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((s) => (
            <div 
              key={s.id} 
              className={`w-3 h-3 rounded-full transition-all duration-500 ${step >= s.id ? "bg-violet-600 w-8" : "bg-slate-200"}`}
            />
          ))}
        </div>
        <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase mb-2">
          {steps.find(s => s.id === step)?.title}
        </h1>
        <p className="text-slate-500 font-medium italic">Paso {step} de 4</p>
      </div>

      <form onSubmit={handleSubmit} className="relative overflow-hidden min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {step === 1 && (
              <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre</label>
                    <input
                      type="text"
                      required
                      placeholder="Juan"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Apellido</label>
                    <input
                      type="text"
                      required
                      placeholder="Pérez"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    required
                    value={formData.fecha_nacimiento}
                    onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tipo</label>
                    <select
                      value={formData.documento_tipo}
                      onChange={(e) => setFormData({...formData, documento_tipo: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-2 text-sm focus:outline-none transition-all"
                    >
                      <option>DNI</option>
                      <option>CUIL</option>
                      <option>PAS</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Número de Documento</label>
                    <input
                      type="text"
                      required
                      placeholder="12.345.678"
                      value={formData.documento_numero}
                      onChange={(e) => setFormData({...formData, documento_numero: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email de Verificación</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium px-1 mt-2">
                    * Te enviaremos un código de seguridad a esta casilla.
                  </p>
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 text-center">
                <div className="w-16 h-16 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                   <Mail size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Verifica tu Email</h2>
                <p className="text-slate-500 font-medium mb-6">Enviamos un código de 6 dígitos a <br/><span className="text-slate-800 font-bold">{formData.email}</span></p>
                
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={formData.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, otp: val});
                    if (val.length === 6) {
                      // Opcional: Auto-verificar al llegar a 6
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-6 text-center text-3xl font-black tracking-[1rem] focus:outline-none focus:border-violet-600 transition-all"
                />
                
                <div className="flex flex-col gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={handleVerifyOTP}
                    disabled={loading || formData.otp.length !== 6}
                    className="w-full bg-violet-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-violet-200 uppercase tracking-widest text-xs disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Verificar Código"}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={triggerOTP}
                    disabled={resending || loading}
                    className="text-slate-400 font-bold text-xs hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={12} className={resending ? "animate-spin" : ""} /> Reenviar código
                  </button>

                  {/* BYPASS PARA TEST */}
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, isVerified: true }));
                        setStep(4);
                      }}
                      className="mt-4 py-2 border border-dashed border-amber-200 text-amber-600 bg-amber-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-100 transition-all"
                    >
                      ⚡️ Saltar Verificación (Modo Test)
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
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
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-violet-600/5 focus:border-violet-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-6 bg-red-50 text-red-500 text-xs font-bold p-4 rounded-2xl border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-5 rounded-[2rem] transition-all uppercase tracking-widest text-sm"
            >
              Atrás
            </button>
          )}
          <button
            type="submit"
            disabled={loading || (step === 3 && !formData.isVerified)}
            className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-violet-600/20 transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest active:scale-95 disabled:grayscale"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : (step === 4 ? "Finalizar" : "Siguiente")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RegisterCliente() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#009EE3]" size={48} />
      </div>
    }>
      <RegisterClienteContent />
    </Suspense>
  );
}
