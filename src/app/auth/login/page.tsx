"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
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
        setError("Las credenciales son incorrectas.");
      } else {
        router.push("/elegir-rol");
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6 bg-[#F5F5F5]">
      <div className="w-full max-w-md bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-4xl font-black text-[#00AEEF] tracking-tighter mb-8">
            JUNTOS
          </Link>
          <h1 className="text-xl font-bold text-gray-800">¡Hola! Para continuar, ingresá</h1>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/elegir-rol" })}
          className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 rounded-md hover:bg-gray-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] mb-8"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.041l3.007-2.329z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.533 0 2.585 2.011 1.251 4.96L4.258 7.29C4.966 5.163 6.95 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-gray-400 font-medium">— o ingresá con email —</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm focus:outline-none focus:border-[#00AEEF] transition-all shadow-none"
              placeholder="Ej: usuario@mail.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold text-gray-700">
                Contraseña
              </label>
              <Link href="#" className="text-xs font-semibold text-[#00AEEF] hover:text-[#0077CC]">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-md py-3 px-4 text-sm focus:outline-none focus:border-[#00AEEF] transition-all shadow-none"
              placeholder="Ingresá tu contraseña"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-md border border-red-100 font-medium text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00AEEF] hover:bg-[#0077CC] text-white font-bold py-3.5 rounded-md shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "Ingresar"}
          </button>
        </form>

        <div className="mt-12 text-center border-t border-gray-100 pt-8">
          <p className="text-sm text-gray-500">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/registro/cliente" className="text-[#00AEEF] font-bold hover:text-[#0077CC]">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
