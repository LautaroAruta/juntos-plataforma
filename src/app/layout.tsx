import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BANDHA | Compras Grupales",
  description: "Plataforma de comercio grupal. Únete a un grupo y obtén los mejores descuentos directamente de fábrica.",
  openGraph: {
    title: "BANDHA | Compras Grupales",
    description: "Comprá en grupo, pagá menos. Unite a una oferta grupal en tu barrio.",
    url: "https://bandha.com.ar",
    siteName: "BANDHA",
    images: [
      {
        url: "/og-image.png", // We should ensure this exists or use a generic one
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BANDHA | Compras Grupales",
    description: "La revolución del ahorro grupal en tu barrio.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  themeColor: "#00AEEF",
};

import NextAuthProvider from "@/components/providers/NextAuthProvider";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import PurchaseNotification from "@/components/shared/PurchaseNotification";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-bandha min-h-screen flex flex-col transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            <Header />

            {/* Contenido principal */}
            <main className="flex-1 w-full relative">
              {children}
            </main>

            <PurchaseNotification />

            <footer className="bg-bandha-surface border-t border-bandha-border pt-16 pb-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                <div className="flex flex-col gap-6">
                  <span className="text-3xl font-black text-[#009EE3] tracking-tighter">BANDHA</span>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    La plataforma donde comprar en equipo te hace pagar menos. Unite a la revolución del ahorro grupal.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-xs">BANDHA</h4>
                  <ul className="flex flex-col gap-4 text-sm text-gray-500">
                    <li><Link href="/como-funciona" className="hover:text-[#009EE3] transition-colors">Cómo funciona</Link></li>
                    <li><Link href="/preguntas-frecuentes" className="hover:text-[#009EE3] transition-colors">Preguntas frecuentes</Link></li>
                    <li><Link href="#" className="hover:text-[#009EE3] transition-colors">Contacto</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-xs">Legal</h4>
                  <ul className="flex flex-col gap-4 text-sm text-gray-500">
                    <li><Link href="/terminos-y-condiciones" className="hover:text-[#009EE3] transition-colors">Términos y condiciones</Link></li>
                    <li><Link href="/privacidad" className="hover:text-[#009EE3] transition-colors">Privacidad</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-800 mb-6 uppercase tracking-wider text-xs">Redes Sociales</h4>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#009EE3] hover:text-white transition-all cursor-pointer">
                      {/* Social icons would go here, using placeholders for now */}
                      <span className="text-[10px] font-bold">IG</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#009EE3] hover:text-white transition-all cursor-pointer">
                      <span className="text-[10px] font-bold">FB</span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#009EE3] hover:text-white transition-all cursor-pointer">
                      <span className="text-[10px] font-bold">TW</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-xs font-medium">
                <p>© 2026 BANDHA. Todos los derechos reservados.</p>
                <div className="flex gap-6">
                  <span>Hecho con ❤️ para vos</span>
                </div>
              </div>
            </div>
          </footer>
          <Toaster />
        </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
