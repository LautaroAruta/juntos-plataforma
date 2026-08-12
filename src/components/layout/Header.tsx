"use client";

import Link from "next/link";
import { Search, User, Menu, LogOut, Loader2, Package } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CartDrawer } from "@/components/cart/CartDrawer";
import AnimatedLogo from "@/components/layout/AnimatedLogo";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import ThemeToggle from "./ThemeToggle";
import UserDropdown from "./UserDropdown";

export default function Header() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const supabase = createClient();

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, nombre, categoria, imagen_principal')
        .ilike('nombre', `%${debouncedSearch}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      }
      setLoading(false);
    }

    fetchSuggestions();
  }, [debouncedSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsDropdownOpen(false);
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full px-4 pt-4 sticky top-0 z-50 pointer-events-none">
        <header className="max-w-7xl mx-auto pointer-events-auto bg-white/70 backdrop-blur-xl border border-gray-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-4 py-2 md:py-3 h-[64px] md:h-[72px]">
          <div className="flex items-center justify-between gap-4 md:gap-8 opacity-0">
            <AnimatedLogo />
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-4 sticky top-0 z-50">
      <header className="max-w-7xl mx-auto bg-white/75 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-5 py-2 md:py-2.5 transition-all duration-300">
        <div className="flex items-center justify-between gap-4 md:gap-8">
        {/* Logo */}
        <AnimatedLogo />

        {/* Search Bar - Mercado Libre Style with Autocomplete */}
        <div className="flex-1 max-w-2xl relative group hidden sm:block" ref={dropdownRef}>
          <form 
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              placeholder="Buscar productos, categorías y más..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full bg-gray-100/80 border border-transparent rounded-full py-2.5 px-5 text-sm focus:bg-white focus:shadow-[0_4px_20px_rgb(0,0,0,0.05)] focus:border-gray-200 transition-all outline-none pr-12 text-black placeholder:text-gray-500"
            />
            <button 
              type="submit"
              className="absolute right-1 top-1 bottom-1 aspect-square flex items-center justify-center rounded-full bg-transparent text-gray-400 hover:text-black hover:bg-gray-100 transition-all"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} strokeWidth={2.5} />}
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (searchQuery.length >= 2 || suggestions.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-bandha-surface border border-bandha-border rounded-xl shadow-2xl overflow-hidden z-[100]">
              {loading && suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs font-bold text-bandha-text-muted uppercase tracking-widest">
                  Buscando...
                </div>
              ) : suggestions.length > 0 ? (
                <div className="flex flex-col">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchQuery(item.nombre);
                        setIsDropdownOpen(false);
                        router.push(`/productos/${item.id}`);
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-bandha-subtle transition-colors text-left border-b border-bandha-border last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-bandha-subtle flex items-center justify-center shrink-0 overflow-hidden">
                        {item.imagen_principal ? (
                          <img src={item.imagen_principal} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package size={18} className="text-bandha-text-muted" />
                        )}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-bandha-text truncate">{item.nombre}</span>
                        <span className="text-[10px] font-black text-bandha-primary uppercase tracking-widest">{item.categoria}</span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      router.push(`/buscar?q=${encodeURIComponent(searchQuery)}`);
                    }}
                    className="p-3 bg-bandha-subtle text-center text-xs font-black text-bandha-primary uppercase tracking-widest hover:bg-bandha-primary/5 transition-colors"
                  >
                    Ver todos los resultados para &quot;{searchQuery}&quot;
                  </button>
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-xs font-bold text-bandha-text-muted uppercase tracking-widest">
                  No se encontraron resultados
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Mobile Search Icon */}
        <button className="sm:hidden text-black p-2 bg-gray-100 rounded-full">
          <Search size={20} />
        </button>

        {/* Navigation & Auth */}
        <nav className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-6">
              <Link href="/productos" className="text-xs font-bold text-gray-500 hover:text-black transition-colors">Ofertas</Link>
              <Link href="/como-funciona" className="text-xs font-bold text-gray-500 hover:text-black transition-colors">Ayuda</Link>
            </div>

            <div className="h-5 w-[1px] bg-gray-200 hidden md:block"></div>

            {session ? (
              <div className="flex items-center gap-2">
                <UserDropdown user={session.user} />
                <div className="bg-gray-100 p-1.5 rounded-full flex items-center justify-center">
                  <CartDrawer />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  href="/auth/login"
                  className="text-xs font-bold text-white bg-black hover:bg-gray-800 transition-all whitespace-nowrap px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgb(0,0,0,0.15)]"
                >
                  Ingresar
                </Link>
                <div className="bg-gray-100 p-1.5 rounded-full flex items-center justify-center hover:bg-gray-200 cursor-pointer transition-colors">
                  <CartDrawer />
                </div>
              </div>
            )}
            
            <button className="md:hidden p-2 text-black bg-gray-100 rounded-full">
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </div>
     </header>
    </div>
  );
}
