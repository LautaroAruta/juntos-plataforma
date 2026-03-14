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

<<<<<<< HEAD
  // Borramos el useEffect que redirigía automáticamente
  
=======
  useEffect(() => {
    // Si el usuario ya tiene un rol asignado, saltamos esta pantalla
    if (session?.user?.rol) {
      if (session.user.rol === "admin") {
        router.push("/gestion-juntos/dashboard");
      } else if (session.user.rol === "cliente") {
        router.push("/dashboard/cliente");
      } else if (session.user.rol === "proveedor") {
        router.push("/proveedor/dashboard");
      }
    }
  }, [session, router]);

>>>>>>> origin/main
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
          .select("id")
          .eq("id", session.user.id)
          .single();
          
        if (providerProfile) {
          targetPath = "/provider/dashboard";
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

  if (!session) return null;

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6 bg-[#F5F5F5]">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-gray-800 tracking-tighter uppercase mb-4">
            ¿Cómo querés usar BANDHA?
          </h1>
          <p className="text-gray-500 text-lg">Elegí tu perfil para continuar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Comprador */}
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-[#009EE3]/5 transition-all">
            <div className="w-24 h-24 bg-[#FFF8E7] rounded-[2rem] flex items-center justify-center text-[#009EE3] mb-8 group-hover:scale-110 transition-transform">
              <ShoppingCart size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-4">Quiero Comprar</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">
              Encontrá los mejores precios comprando en grupo
            </p>
            <button
              onClick={() => handleSelectRole("cliente")}
              disabled={loading}
              className="w-full bg-[#009EE3] hover:bg-[#00A650] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-tight"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Empezar a comprar
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Card Proveedor */}
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-200 flex flex-col items-center text-center group hover:shadow-2xl hover:shadow-gray-300 transition-all">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center text-gray-400 group-hover:bg-gray-800 group-hover:text-white transition-all mb-8 group-hover:scale-110">
              <Store size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-4">Quiero ser Proveedor</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed text-lg">
              Vendé tus productos en grupo. Registrá tu negocio.
            </p>
            <button
              onClick={() => handleSelectRole("proveedor")}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-black text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-tight"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                  Registrar negocio
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
