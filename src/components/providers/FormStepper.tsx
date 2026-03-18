"use client";

import { User, Building2, FileText, Landmark, CheckCircle } from "lucide-react";

interface FormStepperProps {
  currentStep: number;
  totalSteps: number;
}

const STEPS = [
  { icon: User, label: "Tipo" },
  { icon: Building2, label: "Negocio" },
  { icon: FileText, label: "Fiscal" },
  { icon: Landmark, label: "Banco" },
  { icon: CheckCircle, label: "Confirmar" },
];

export function FormStepper({ currentStep, totalSteps }: FormStepperProps) {
  return (
    <div className="flex items-center justify-between w-full mb-10">
      {STEPS.slice(0, totalSteps).map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;
        const Icon = step.icon;

        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-sm
                  ${isCompleted 
                    ? "bg-[#00A650] text-white shadow-[#00A650]/30 scale-90" 
                    : isActive 
                      ? "bg-[#009EE3] text-white shadow-[#009EE3]/30 shadow-lg scale-110" 
                      : "bg-slate-100 text-slate-300"
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle size={20} strokeWidth={2.5} />
                ) : (
                  <Icon size={20} strokeWidth={2.5} />
                )}
              </div>
              <span
                className={`
                  text-[10px] font-black uppercase tracking-widest transition-colors duration-300
                  ${isActive ? "text-[#009EE3]" : isCompleted ? "text-[#00A650]" : "text-slate-300"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {stepNum < totalSteps && (
              <div className="flex-1 mx-3 h-0.5 rounded-full relative overflow-hidden bg-slate-100">
                <div
                  className="absolute inset-y-0 left-0 bg-[#00A650] rounded-full transition-all duration-700 ease-out"
                  style={{ width: isCompleted ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
