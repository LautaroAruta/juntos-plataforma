import type { Metadata } from "next";
import { Inter, Geist, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import "@/lib/env"; // Trigger early environment validation
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const geist = Geist({ 
  variable: "--font-sans", 
  subsets: ["latin"] 
});

export const metadata: Metadata = {
  title: "BANDHA | Compras Grupales",
  description: "Plataforma de comercio grupal. Únete a un grupo y obtén los mejores descuentos directamente de fábrica.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "BANDHA | Compras Grupales",
    description: "Comprá en grupo, pagá menos. Unite a una oferta grupal en tu barrio.",
    url: "https://bandha.com.ar",
    siteName: "BANDHA",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
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
};

export const viewport = {
  themeColor: "#FFF159",
};

import { 
  Instagram, 
  MessageCircle, 
  Twitter, 
  Facebook,
  ShieldCheck,
  Award
} from "lucide-react";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import PurchaseNotification from "@/components/shared/PurchaseNotification";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import PWAProvider from "@/components/providers/PWAProvider";
import InstallPWA from "@/components/growth/InstallPWA";
import ReferralTracker from "@/components/growth/ReferralTracker";
import SocialTicker from "@/components/home/SocialTicker";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn(geist.variable, plusJakarta.variable, "scroll-smooth")} suppressHydrationWarning>
      <body className={cn(inter.variable, "antialiased bg-[#F5F5F7] min-h-screen flex flex-col transition-colors duration-500")} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SocialTicker />
          <PWAProvider>
            <NextAuthProvider>
              <Header />
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>

              <main className="flex-1 w-full relative">
                {children}
              </main>

              <PurchaseNotification />
              <InstallPWA />

              <footer className="bg-white border-t border-gray-200 pt-20 pb-12 px-6 mt-auto relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-black text-xl">B</div>
                        <span className="text-2xl font-black tracking-tighter text-black">BANDHA</span>
                      </div>
                      <p className="text-gray-500 text-sm leading-relaxed max-w-xs font-medium">
                        La nueva forma de comprar. Inteligente, directa y comunitaria.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-400 mb-6 text-xs uppercase tracking-widest">Plataforma</h4>
                      <ul className="flex flex-col gap-3 text-sm text-black font-semibold">
                        <li><Link href="/como-funciona" className="hover:text-gray-500 transition-colors">Cómo funciona</Link></li>
                        <li><Link href="/preguntas-frecuentes" className="hover:text-gray-500 transition-colors">Preguntas frecuentes</Link></li>
                        <li><a href="mailto:hola@bandha.com.ar" className="hover:text-gray-500 transition-colors">Contacto</a></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-400 mb-6 text-xs uppercase tracking-widest">Legales</h4>
                      <ul className="flex flex-col gap-3 text-sm text-black font-semibold">
                        <li><Link href="/terminos-y-condiciones" className="hover:text-gray-500 transition-colors">Términos y condiciones</Link></li>
                        <li><Link href="/privacidad" className="hover:text-gray-500 transition-colors">Privacidad</Link></li>
                        <li><Link href="/defensa-del-consumidor" className="hover:text-gray-500 transition-colors">Defensa del consumidor</Link></li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-gray-400 mb-6 text-xs uppercase tracking-widest">Conectar</h4>
                      <div className="flex gap-4">
                        <a href="https://instagram.com/bandha.ar" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-all shadow-sm">
                          <Instagram size={20} />
                        </a>
                        <a href="#" className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-black hover:bg-gray-200 transition-all shadow-sm">
                          <MessageCircle size={20} />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                    <p>© 2024-2026 BANDHA. Juntos Compramos Mejor.</p>
                    <div className="flex gap-6 grayscale opacity-30 hover:opacity-100 transition-opacity">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Data_Fiscal.png" alt="Data Fiscal" className="h-8" />
                    </div>
                  </div>
                </div>
              </footer>
              <Toaster />
            </NextAuthProvider>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
