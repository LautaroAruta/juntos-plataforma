"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

interface FormTooltipProps {
  text: string;
}

export function FormTooltip({ text }: FormTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block ml-1.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-slate-300 hover:text-[#009EE3] transition-colors"
        aria-label="Más información"
      >
        <HelpCircle size={14} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-800 text-white text-[11px] leading-relaxed rounded-xl px-4 py-3 shadow-xl shadow-slate-900/20 font-medium">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
              <div className="w-2 h-2 bg-slate-800 rotate-45" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
