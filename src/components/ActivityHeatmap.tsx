"use client";

import React from 'react';
import { Flame } from 'lucide-react';

export function ActivityHeatmap({ activityData }: { activityData: Record<string, number> }) {
  // Generate last 100 days for the grid (can be expanded to 365)
  const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (90 - i));
    return d.toISOString().split('T')[0];
  });

  return (
    <section className="mt-16 bg-[#090909] border border-zinc-900 rounded-[2.5rem] p-10 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-emerald-500 border border-zinc-800">
            <Flame size={20} fill="currentColor" />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Consistency Monitor</h3>
            <p className="text-xl font-black text-white tracking-tighter uppercase italic">Daily Activity Trajectory</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] font-black text-zinc-700 uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-2.5 h-2.5 rounded-sm bg-zinc-900 border border-zinc-800" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500/50" />
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* The Grid */}
      <div className="flex flex-wrap gap-2">
        {days.map((date) => {
          const count = activityData[date] || 0;
          return (
            <div 
              key={date}
              title={`${date}: ${count} lessons`}
              className={`w-3.5 h-3.5 rounded-sm border transition-all duration-500 ${
                count === 0 ? 'bg-zinc-950 border-zinc-900' : 
                count === 1 ? 'bg-emerald-500/20 border-emerald-500/10' :
                count === 2 ? 'bg-emerald-500/50 border-emerald-500/20' :
                'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              }`}
            />
          );
        })}
      </div>
      
      <p className="mt-6 text-[9px] font-black text-zinc-800 uppercase tracking-[0.2em] italic">
        * Syncing live completion data from strategic tracks
      </p>
    </section>
  );
}