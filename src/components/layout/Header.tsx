"use client";

import Link from "next/link";
import { Search, User, Menu, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm px-4 py-2 md:py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <span className="text-2xl md:text-3xl font-black text-[#00AEEF] tracking-tighter">JUNTOS</span>
        </Link>

        {/* Search Bar - Mercado Libre Style */}
        <form 
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl relative group hidden sm:block"
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar productos, categorías y más..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded shadow-sm py-2 px-4 shadow-none text-sm focus:border-[#00AEEF] transition-all outline-none pr-10"
            />
            <div className="absolute right-0 top-0 h-full flex items-center pr-3 border-l border-gray-100 my-auto pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
          </div>
        </form>

        {/* Mobile Search Icon */}
        <button className="sm:hidden text-gray-600 p-2">
          <Search size={22} />
        </button>

        {/* Navigation & Auth */}
        <nav className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/productos" className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-tight">Ofertas</Link>
            <Link href="/como-funciona" className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-tight">Ayuda</Link>
          </div>

          <div className="h-4 w-[1px] bg-gray-200 hidden md:block"></div>

          {session ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200 group-hover:border-[#00AEEF] transition-all">
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <span className="text-xs font-bold text-gray-600 hidden lg:block">{session.user.name?.split(' ')[0]}</span>
              </Link>
              <Link href="/carrito" className="text-gray-500 hover:text-[#00AEEF] transition-colors">
                <ShoppingCart size={20} />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                href="/auth/login"
                className="text-xs font-bold text-gray-600 hover:text-[#00AEEF] transition-all whitespace-nowrap"
              >
                Ingresar
              </Link>
              <Link href="/carrito" className="text-gray-500 hover:text-[#00AEEF] transition-colors">
                <ShoppingCart size={20} />
              </Link>
            </div>
          )}
          
          <button className="md:hidden p-1 text-gray-600">
            <Menu size={24} />
          </button>
        </nav>
      </div>
    </header>
  );
}
