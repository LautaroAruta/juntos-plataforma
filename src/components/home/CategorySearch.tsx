"use client";

import Link from "next/link";
import { 
  Smartphone, 
  ShoppingBag, 
  Armchair, 
  Sparkles, 
  UtensilsCrossed, 
  Gamepad2,
  ChevronRight
} from "lucide-react";

const categories = [
  { name: "Tecnología", icon: <Smartphone size={24} />, color: "#F1F0EE", href: "/categoria/tecnologia" },
  { name: "Moda", icon: <ShoppingBag size={24} />, color: "#F1F0EE", href: "/categoria/moda" },
  { name: "Hogar", icon: <Armchair size={24} />, color: "#F1F0EE", href: "/categoria/hogar" },
  { name: "Belleza", icon: <Sparkles size={24} />, color: "#F1F0EE", href: "/categoria/belleza" },
  { name: "Gourmet", icon: <UtensilsCrossed size={24} />, color: "#F1F0EE", href: "/categoria/gourmet" },
];

export default function CategorySearch() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {categories.map((cat) => (
        <Link 
          key={cat.name} 
          href={cat.href}
          className="boutique-card p-8 flex flex-col items-center gap-6 group hover:border-brand-camel transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-stone flex items-center justify-center text-brand-charcoal group-hover:bg-brand-camel group-hover:text-white transition-all duration-500">
            {cat.icon}
          </div>
          <div className="text-center space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-brand-charcoal">{cat.name}</span>
            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-bold text-brand-camel uppercase tracking-[0.2em]">Explorar</span>
               <ChevronRight size={12} className="text-brand-camel" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
