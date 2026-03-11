import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JUNTOS | Compras Grupales",
  description: "Plataforma de comercio grupal. Únete a un grupo y obtén los mejores descuentos directamente de fábrica.",
};

import NextAuthProvider from "@/components/providers/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased text-slate-800 bg-[#E8F7FF] min-h-screen flex flex-col`}>
        <NextAuthProvider>
          {/* Header simple por ahora, luego lo moveremos a un componente */}
          <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-screen-md mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#00AEEF] tracking-tighter">JUNTOS</span>
              </div>
              <nav className="flex items-center gap-4 text-sm font-medium uppercase tracking-tighter">
                <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600">Admin</Link>
                <Link href="/provider/dashboard" className="text-slate-400 hover:text-slate-600">Proveedor</Link>
                <Link href="/auth/login" className="text-[#0077CC] font-black underline decoration-2 underline-offset-4">Ingresar</Link>
              </nav>
            </div>
          </header>

          {/* Contenido principal móvil first */}
          <main className="flex-1 max-w-screen-md mx-auto w-full relative">
            {children}
          </main>

          <footer className="bg-white py-8 border-t border-gray-100 mt-auto">
            <div className="max-w-screen-md mx-auto px-4 text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} JUNTOS. Todos los derechos reservados.
            </div>
          </footer>
        </NextAuthProvider>
      </body>
    </html>
  );
}
