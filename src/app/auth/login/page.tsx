"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().min(1, { message: "El correo es requerido" }).email({
    message: "Debe ser un correo electrónico válido",
  }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F5F5F7] py-24">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)] border border-gray-100 p-10 md:p-14 relative overflow-hidden">
        
        <div className="text-center mb-12 relative z-10">
          <Link href="/" className="inline-block text-4xl font-black text-black tracking-tighter mb-8 hover:opacity-70 transition-opacity">
            BANDHA
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-black tracking-tighter">Acceso</h1>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/elegir-rol" })}
          className="w-full bg-[#F5F5F7] text-black font-bold py-4 rounded-full flex items-center justify-center gap-3 shadow-none hover:bg-gray-200 transition-all active:scale-[0.98] mb-10 text-xs uppercase tracking-widest"
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
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-gray-400">
            <span className="bg-white px-4">o vía email</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="usuario@mail.com" 
                      className="h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-gray-100 focus:border-black transition-all font-medium pt-7 pb-3 px-4 shadow-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contraseña</FormLabel>
                    <Link href="#" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-widest transition-colors">
                      ¿Olvidaste?
                    </Link>
                  </div>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="••••••••••••" 
                      className="h-14 bg-gray-50 border-gray-100 rounded-2xl focus:ring-gray-100 focus:border-black transition-all font-medium pt-7 pb-3 px-4 shadow-none tracking-[0.2em]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] uppercase font-bold tracking-tight" />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-[10px] p-3 rounded-lg border border-red-100 font-bold uppercase tracking-widest text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-800 text-white font-black py-7 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest mt-8"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Iniciar sesión"}
            </Button>
          </form>
        </Form>

        <div className="mt-14 text-center">
          <p className="text-xs font-semibold text-gray-500">
            ¿Primera vez en BANDHA?{" "}
            <Link href="/auth/registro" className="text-black font-black hover:underline transition-all underline-offset-4">
              Creá tu cuenta gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
