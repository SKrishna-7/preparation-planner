"use client";

import { Flame, User } from "lucide-react";

interface HeaderProps {
  userName?: string;
  streak?: number;
}


export function DashboardHeader() {
    
   const userName="Suresh Krishnan S";
   const streak=12
  return (
  <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full mb-10 pb-6 border-b border-zinc-800/50 animate-in fade-in slide-in-from-top-4 duration-500">
  {/* Left: Professional Context & Welcome */}
  <div>
    <h1 className="text-xl font-tight text-white tracking-tight leading-tight">
      Welcome back,<br />
    </h1>
    <span className="inline-block pt-1 text-3xl font-bold text-zinc-100">{userName}</span>
  </div>

  {/* Right: Focused Actions */}
  <div className="flex items-center gap-4">
    {/* Streak Indicator - Minimalist SaaS Style */}
    <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg text-orange-500 shadow-sm">
      <Flame size={18} fill="currentColor" className="opacity-90" />
      <div className="flex flex-col leading-none">
        <span className="font-bold text-sm text-zinc-100">{streak}</span>
        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Day Streak</span>
      </div>
    </div>

    {/* Profile Avatar */}
    <div className="ml-2 pl-4 border-l border-zinc-800">
      <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-indigo-500/10 ring-1 ring-white/10 hover:scale-105 transition-transform cursor-pointer">
        {userName[0].toUpperCase() || "Suresh Krishnan S"}
      </div>
    </div>
  </div>
</header>
  );
}