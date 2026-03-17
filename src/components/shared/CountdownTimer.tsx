"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string | Date;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
  iconSize?: number;
  variant?: 'default' | 'simple';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export default function CountdownTimer({ 
  targetDate, 
  onExpire, 
  className = "", 
  showIcon = true,
  iconSize = 12,
  variant = 'default'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        if (onExpire) onExpire();
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        totalSeconds: Math.floor(difference / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining.totalSeconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  // Urgent style if less than 1 hour remains
  const isUrgent = timeLeft.totalSeconds > 0 && timeLeft.totalSeconds < 3600;
  const isExpired = timeLeft.totalSeconds <= 0;

  if (isExpired) {
    return (
      <div className={`flex items-center gap-1 text-slate-400 font-black text-sm bg-slate-50 px-2 py-1 rounded-lg ${className}`}>
        {showIcon && <Timer size={14} />} 
        <span>EXPIRADO</span>
      </div>
    );
  }

  if (variant === 'simple') {
    return (
      <div className={`flex items-center gap-1 font-black tracking-tight ${className}`}>
        {showIcon && <Timer size={iconSize} className={isUrgent ? "animate-pulse text-red-600" : "text-slate-400"} />}
        <span className="text-slate-900 uppercase">
          {timeLeft.days > 0 ? (
            `¡${timeLeft.days} ${timeLeft.days === 1 ? 'DÍA' : 'DÍAS'}!`
          ) : timeLeft.hours > 0 ? (
            `¡${timeLeft.hours} HORAS!`
          ) : (
            `¡${timeLeft.minutes} MIN!`
          )}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 font-black tracking-tight transition-all ${className}`}>
      {showIcon && <Timer size={iconSize} className={isUrgent ? "animate-pulse text-red-600" : "text-slate-400"} />}
      <div className="flex items-baseline gap-1">
        {timeLeft.days > 0 && (
          <>
            <span className="text-slate-900">{timeLeft.days}</span>
            <span className="text-[10px] text-slate-900 uppercase tracking-widest mr-1">DÍAS</span>
          </>
        )}
        <span className="text-slate-900">{timeLeft.hours}</span>
        <span className="text-[10px] text-slate-900 font-bold mr-1">horas</span>
        <span className="text-slate-300 font-light mx-0.5">|</span>
        <span className="text-slate-900">{timeLeft.minutes}</span>
        <span className="text-[10px] text-slate-900 font-bold">min!</span>
      </div>
    </div>
  );
}
