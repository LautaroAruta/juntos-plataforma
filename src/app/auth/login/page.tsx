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
    <div className="min-h-[calc(100vh-180px)] flex items-center justify-center p-6 bg-bandha-bg">
      <div className="w-full max-w-md bg-bandha-surface rounded-lg p-8 md:p-12 shadow-sm border border-bandha-border">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-4xl font-black text-bandha-primary tracking-tighter mb-8">
            BANDHA
          </Link>
          <h1 className="text-xl font-bold text-bandha-text">¡Hola! Para continuar, ingresá</h1>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/elegir-rol" })}
          className="w-full bg-bandha-surface border border-bandha-border text-bandha-text font-semibold py-3 rounded-md hover:bg-bandha-subtle transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] mb-8"
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
            <div className="w-full border-t border-bandha-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bandha-surface px-4 text-bandha-text-muted font-medium">— o ingresá con email —</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: usuario@mail.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Contraseña</FormLabel>
                    <Link href="#" className="text-xs font-semibold text-bandha-primary hover:text-bandha-secondary">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="Ingresá tu contraseña" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-md border border-red-100 font-medium text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-bandha-primary hover:bg-bandha-secondary text-white font-bold h-12 rounded-md shadow-sm transition-all active:scale-[0.98] mt-4 text-base"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Ingresar"}
            </Button>
          </form>
        </Form>

        <div className="mt-12 text-center border-t border-bandha-border pt-8">
          <p className="text-sm text-bandha-text-secondary">
            ¿No tenés cuenta?{" "}
            <Link href="/auth/registro/cliente" className="text-bandha-primary font-bold hover:text-bandha-secondary">
              Registrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
