"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  User, 
  Settings, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  UserCircle,
  ShoppingBag,
  Gift
} from "lucide-react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rol?: string;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = user.rol === "admin" && user.email === "aruta839@gmail.com";
  const isProvider = user.rol === "proveedor" || user.rol === "admin";
  const firstName = user.name?.split(" ")[0] || "Usuario";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1 pr-3 rounded-full hover:bg-gray-100 transition-all border border-transparent"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-300 group-hover:border-black transition-all">
          {user.image && !imgError && user.image.length > 5 ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
          ) : (
            <UserCircle size={20} strokeWidth={2.5} />
          )}
        </div>
        <span className="text-xs font-bold text-gray-600 hidden md:block">
          {firstName}
        </span>
        <ChevronDown 
          size={14} 
          className={`text-bandha-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute right-0 mt-2 w-56 bg-bandha-surface border border-bandha-border rounded-2xl shadow-2xl shadow-bandha-primary/10 overflow-hidden z-[100]"
          >
            {/* User Info Header */}
            <div className="p-4 bg-bandha-subtle/50 border-b border-bandha-border">
              <p className="text-[10px] font-black text-bandha-text-muted uppercase tracking-widest mb-1">Cuenta</p>
              <p className="text-sm font-bold text-bandha-text truncate">{user.name}</p>
              <p className="text-[10px] font-medium text-bandha-text-muted truncate">{user.email}</p>
            </div>

            <div className="p-2">
              {/* Provider specific actions */}
              {isProvider && (
                <Link
                  href="/provider/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-bandha-text hover:bg-bandha-primary/5 hover:text-bandha-primary transition-all group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-bandha-primary/10 flex items-center justify-center text-bandha-primary">
                    <LayoutDashboard size={16} strokeWidth={2.5} />
                  </div>
                  <span>Panel de Proveedor</span>
                </Link>
              )}

              {/* Admin specific actions */}
              {isAdmin && (
                <Link
                  href="/gestion-bandha"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-bandha-danger hover:bg-bandha-danger/5 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-bandha-danger/10 flex items-center justify-center text-bandha-danger">
                    <ShieldCheck size={16} strokeWidth={2.5} />
                  </div>
                  <span>Panel Admin</span>
                </Link>
              )}

              {/* MIS COMPRAS LINK */}
              <Link
                href="/perfil/compras"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-bandha-text hover:bg-bandha-subtle transition-all group/item"
              >
                <div className="w-8 h-8 rounded-lg bg-bandha-subtle flex items-center justify-center text-bandha-text-secondary group-hover/item:text-bandha-primary transition-colors">
                  <ShoppingBag size={16} strokeWidth={2.5} />
                </div>
                <span>Mis Compras</span>
              </Link>

              {/* Common profile setting */}
              <Link
                href="/configuracion/perfil"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-bandha-text hover:bg-bandha-subtle transition-all group/item"
              >
                <div className="w-8 h-8 rounded-lg bg-bandha-subtle flex items-center justify-center text-bandha-text-secondary group-hover/item:text-bandha-primary transition-colors">
                  <Settings size={16} strokeWidth={2.5} />
                </div>
                <span>Configuración de Perfil</span>
              </Link>
              
              {/* BILLETERA LINK */}
              {!isProvider && (
                <Link
                  href="/perfil/billetera"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-violet-600 hover:bg-violet-50 transition-all border border-transparent hover:border-violet-100"
                >
                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600">
                    <Gift size={16} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col">
                    <span>Mi Billetera</span>
                  </div>
                </Link>
              )}

              <div className="h-px bg-bandha-border my-2 mx-2" />

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-bandha-text-muted hover:bg-red-50 hover:text-red-500 transition-all group/logout"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover/logout:bg-red-100 group-hover/logout:text-red-500 transition-all">
                  <LogOut size={16} strokeWidth={2.5} />
                </div>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
