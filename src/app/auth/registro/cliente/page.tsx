"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin, ChevronLeft, Loader2, CheckCircle2, RefreshCcw, Gift } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { motion, AnimatePresence } from "framer-motion";

function RegisterClienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCodeFromUrl = searchParams.get("ref");
  const [referralCode, setReferralCode] = useState<string | null>(referralCodeFromUrl);

  useEffect(() => {
    if (!referralCode) {
      const stored = localStorage.getItem("bandha_ref");
      if (stored) {
        console.log("BANDHA: Using stored referral code:", stored);
        setReferralCode(stored);
      }
    }
  }, [referralCode]);
  
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
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-brand-warm py-24">
        <div className="max-w-md bg-white boutique-card p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sage/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand-sage/5 text-brand-sage mb-8">
            <CheckCircle2 size={48} />
          </div>
          <h1 className="text-3xl font-black font-serif text-brand-charcoal mb-4 tracking-tighter">¡Casi listo!</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Enviamos un link de verificación a <span className="font-bold text-brand-charcoal">{formData.email}</span>. 
            Por favor, revisá tu casilla para activar tu cuenta.
          </p>
          <Link href="/auth/login" className="btn-boutique w-full">
            Ir al Acceso
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
    <div className="min-h-screen bg-brand-warm pb-32 px-4 pt-16">
      <div className="max-w-lg mx-auto">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-charcoal mb-12 transition-colors group">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Login
        </Link>

        <div className="mb-14 text-center">
          <div className="flex justify-center gap-3 mb-8">
            {steps.map((s) => (
              <div 
                key={s.id} 
                className={`h-1 rounded-full transition-all duration-700 ${step >= s.id ? "bg-brand-charcoal w-10" : "bg-stone-200 w-4"}`}
              />
            ))}
          </div>
          <div className="space-y-3">
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-camel block">Paso {step} de 4</span>
             <h1 className="text-4xl font-black font-serif text-brand-charcoal tracking-tighter">
               {steps.find(s => s.id === step)?.title}
             </h1>
          </div>
          
          {referralCode && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-brand-sage/5 text-brand-sage rounded-full border border-brand-sage/10">
              <Gift size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Referido con éxito
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5, ease: "anticipate" }}
              className="space-y-8"
            >
              {step === 1 && (
                <div className="space-y-6 bg-white boutique-card p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stone/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
                  
                  <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nombre</label>
                      <input
                        type="text"
                        required
                        placeholder="Juan"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
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
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})}
                      className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6 relative z-10">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Tipo</label>
                      <select
                        value={formData.documento_tipo}
                        onChange={(e) => setFormData({...formData, documento_tipo: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-3 text-sm focus:outline-none transition-all font-bold appearance-none"
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
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 px-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 bg-white boutique-card p-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stone/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
                  
                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Email de Verificación</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-bold"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium px-1 mt-3 italic tracking-tight">
                      * Enviaremos un código de seguridad a esta casilla.
                    </p>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Teléfono (WhatsApp)</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="text"
                        required
                        placeholder="+54 9 11 1234-5678"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 bg-white boutique-card p-10 text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stone/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
                  
                  <div className="w-20 h-20 bg-brand-stone flex items-center justify-center rounded-3xl text-brand-charcoal mx-auto relative z-10">
                     <Mail size={32} />
                  </div>
                  
                  <div className="space-y-2 relative z-10">
                    <h2 className="text-2xl font-black font-serif text-brand-charcoal tracking-tighter">Validar Casilla</h2>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed px-4">
                      Introducí el código de 6 dígitos enviado a:<br/>
                      <span className="text-brand-charcoal font-bold">{formData.email}</span>
                    </p>
                  </div>
                  
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({...formData, otp: val});
                    }}
                    className="w-full bg-stone-50 border border-stone-100 rounded-2xl py-8 text-center text-4xl font-black tracking-[1rem] focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all relative z-10"
                  />
                  
                  <div className="flex flex-col gap-4 relative z-10">
                    <button 
                      type="button" 
                      onClick={handleVerifyOTP}
                      disabled={loading || formData.otp.length !== 6}
                      className="btn-boutique w-full h-14 rounded-xl disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Verificar Identidad"}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={triggerOTP}
                      disabled={resending || loading}
                      className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-charcoal transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCcw size={14} className={resending ? "animate-spin" : ""} /> Solicitar nuevo código
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setFormData(prev => ({ ...prev, isVerified: true }));
                          setStep(4);
                        }}
                        className="mt-4 p-3 border border-stone-100 text-brand-camel bg-brand-stone rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-stone-100 transition-all"
                      >
                        ⚡️ Bypass Verificación (Test)
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 bg-white boutique-card p-10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-brand-stone/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-30" />
                  
                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="password"
                        required
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Confirmar Contraseña</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-100 rounded-xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-brand-camel/20 focus:border-brand-camel transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {error && (
            <div className="mt-8 bg-red-50 text-red-600 text-[10px] font-bold p-4 rounded-xl border border-red-100 uppercase tracking-widest text-center animate-shake">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-12 relative z-10">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 bg-white border border-stone-100 text-brand-charcoal font-black py-5 rounded-2xl transition-all uppercase tracking-widest text-[10px] hover:bg-stone-50 active:scale-95"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={loading || (step === 3 && !formData.isVerified)}
              className="flex-[2] btn-boutique h-16 rounded-2xl shadow-xl shadow-brand-charcoal/5 flex items-center justify-center gap-3 text-xs active:scale-95 disabled:grayscale"
            >
              {loading ? <Loader2 className="animate-spin text-white" size={24} /> : (step === 4 ? "Finalizar Registro" : "Continuar")}
            </button>
          </div>
        </form>
      </div>
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
