"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-brand-primary/30 transition-all group overflow-hidden"
      aria-label="Cambiar tema"
    >
      <div className="relative w-5 h-5">
        <Sun className="absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
        <Moon className="absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#3DB8FF]" />
      </div>
      
      {/* Subtle hover effect background */}
      <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 transition-colors -z-10" />
    </button>
  );
}
