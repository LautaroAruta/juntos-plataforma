"use client";

import { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string | Date;
  onExpire?: () => void;
  className?: string;
  showIcon?: boolean;
}

export default function CountdownTimer({ targetDate, onExpire, className = "", showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        if (onExpire) onExpire();
        return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
      }

      return {
        hours: Math.floor((difference / (1000 * 60 * 60))),
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

  return (
    <div className={`flex items-center gap-1 font-black text-sm px-2 py-1 rounded-lg transition-all ${
      isUrgent 
        ? "text-red-500 bg-red-50 animate-pulse ring-1 ring-red-200" 
        : "text-[#00AEEF] bg-[#E8F7FF]"
    } ${className}`}>
      {showIcon && <Timer size={14} className={isUrgent ? "animate-spin-slow" : ""} />}
      <span>
        {timeLeft.hours > 0 && `${timeLeft.hours}h `}
        {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}
