"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Store, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ElegirRolPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // Borramos el useEffect que redirigía automáticamente para permitir selección de rol persistente
  const handleSelectRole = async (role: "cliente" | "proveedor") => {
    if (!session?.user?.email) return;
    
    setLoading(true);
    try {
      // 1. Actualizamos el rol en la tabla users
      const { error } = await supabase
        .from("users")
        .update({ rol: role })
        .eq("email", session.user.email);

      if (error) throw error;

      // 2. Si elige proveedor, verificamos si ya tiene perfil creado
      let targetPath = role === "cliente" ? "/dashboard/cliente" : "/auth/registro/proveedor";
      
      if (role === "proveedor") {
        const { data: providerProfile } = await supabase
          .from("providers")
          .select("id, estado_kyc, verificado")
          .eq("id", session.user.id)
          .single();
          
        if (providerProfile) {
          // Si KYC aprobado o verificado → dashboard, sino → estado verificación
          if (providerProfile.verificado || providerProfile.estado_kyc === "aprobado") {
            targetPath = "/provider/dashboard";
          } else {
            targetPath = "/provider/estado-verificacion";
          }
        }
      }

      // 3. Actualizamos la sesión para reflejar el nuevo rol
      await update({ rol: role });

      // 4. Redirigimos
      router.push(targetPath);
    } catch (err) {
      console.error("Error setting role:", err);
      alert("Hubo un error al guardar tu elección. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (session === undefined || (typeof window !== "undefined" && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBFA]">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-brand-camel animate-spin" strokeWidth={1.5} />
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Sincronizando Colección</p>
        </div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#FCFBFA] py-24">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-20">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-camel mb-4 block">Bienvenido a su Espacio</span>
          <h1 className="text-4xl md:text-6xl font-black font-serif text-brand-charcoal tracking-tighter mb-6">
            ¿Cómo desea <span className="text-brand-camel italic">participar</span> hoy?
          </h1>
          <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">Seleccione su perfil de acceso</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Card Comprador */}
          <div className="bg-white boutique-card p-12 flex flex-col items-center text-center group cursor-pointer"
               onClick={() => handleSelectRole("cliente")}>
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-brand-camel mb-10 border border-stone-100 shadow-xl shadow-brand-camel/5 group-hover:scale-110 transition-transform duration-500">
              <ShoppingCart size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black font-serif text-brand-charcoal tracking-tight mb-4">Adquirir Colecciones</h2>
            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm">
              Explore curadurías exclusivas de su comunidad y acceda a beneficios por compra grupal.
            </p>
            <button
              disabled={loading}
              className="w-full btn-boutique h-16 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-xs tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Entrar como Cliente
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Card Proveedor */}
          <div className="bg-brand-charcoal boutique-card p-12 flex flex-col items-center text-center group cursor-pointer"
               onClick={() => handleSelectRole("proveedor")}>
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-brand-camel mb-10 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Store size={40} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black font-serif text-white tracking-tight mb-4">Ser el Curador</h2>
            <p className="text-white/40 font-medium mb-10 leading-relaxed text-sm px-4">
              Gestione su inventario, publique ofertas exclusivas y potencie su negocio con Bandha.
            </p>
            <button
              disabled={loading}
              className="w-full bg-white text-brand-charcoal hover:bg-brand-stone font-black h-16 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 text-xs tracking-widest uppercase"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Panel de Proveedor
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
