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

export default function Header() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  return (
    <header className="sticky top-0 z-50 bg-bandha-surface border-b border-bandha-border shadow-sm px-4 py-2 md:py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
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
              className="w-full bg-bandha-surface border border-bandha-border rounded shadow-sm py-2 px-4 text-sm focus:border-bandha-primary transition-all outline-none pr-10 text-bandha-text placeholder:text-bandha-text-muted"
            />
            <button 
              type="submit"
              className="absolute right-0 top-0 h-full flex items-center pr-3 border-l border-bandha-border bg-transparent text-bandha-text-muted hover:text-bandha-primary transition-colors"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
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
        <button className="sm:hidden text-bandha-text-secondary p-2">
          <Search size={22} />
        </button>

        {/* Navigation & Auth */}
        <nav className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="hidden md:flex items-center gap-6">
              <Link href="/productos" className="text-xs font-semibold text-gray-400 hover:text-bandha-text transition-colors uppercase tracking-tight">Ofertas</Link>
              <Link href="/como-funciona" className="text-xs font-semibold text-gray-400 hover:text-bandha-text transition-colors uppercase tracking-tight">Ayuda</Link>
            </div>

            <div className="h-4 w-[1px] bg-bandha-border hidden md:block"></div>

            {session ? (
              <div className="flex items-center gap-4">
                <Link 
                  href="/dashboard"
                  className="flex items-center gap-2 group"
                >
                  <div className="w-8 h-8 rounded-full bg-bandha-subtle flex items-center justify-center text-bandha-text-secondary overflow-hidden border border-bandha-border group-hover:border-bandha-primary transition-all">
                    {session.user.image ? (
                      <img src={session.user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-bandha-text-secondary hidden lg:block">{session.user.name?.split(' ')[0]}</span>
                </Link>
                <CartDrawer />
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })} 
                  className="text-bandha-text-secondary hover:text-bandha-danger transition-colors ml-2"
                  title="Cerrar Sesión"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link 
                  href="/auth/login"
                  className="text-xs font-bold text-bandha-text-secondary hover:text-bandha-primary transition-all whitespace-nowrap"
                >
                  Ingresar
                </Link>
                <CartDrawer />
              </div>
            )}
            
            <button className="md:hidden p-1 text-bandha-text-secondary">
              <Menu size={24} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
