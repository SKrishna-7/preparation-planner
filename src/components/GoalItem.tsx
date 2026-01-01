"use client";

import { useTransition } from "react";
import { Trash2, Target, Layers, Loader2, Clock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { deleteGoalAction } from "@actions/goals";

export function GoalItem({
  goal,
  courseName,
  onToggle
}: {
  goal: any;
  courseName?: string;
  onToggle: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const progress = goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0;
  
  const itemsRemaining = goal.target - goal.current;
  const daysRemaining = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the detail page
    if (confirm("Decommission this strategic objective?")) {
      startTransition(async () => {
        await deleteGoalAction(goal.id);
      });
    }
  };

  return (
    <Link href={`/goals/${goal.id}`}  onClick={() => onToggle(goal.id)}>
      <div className={`group relative bg-[#090909] border border-zinc-900 rounded-[1.5rem] p-6 hover:bg-[#0c0c0c] hover:border-zinc-800 transition-all duration-500 cursor-pointer shadow-2xl ${isPending ? 'opacity-50' : ''}`}>
        <div className="flex justify-between items-start mb-4">
          <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${daysRemaining < 3 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'text-zinc-600'}`}>
            {daysRemaining < 3 ? 'URGENT: DEADLINE NEAR' : 'STRATEGIC TRACK'}
          </span>
          <ArrowUpRight size={14} className="text-zinc-700 group-hover:text-white transition-colors" />
        </div>

        <h4 className="text-lg font-black text-white mb-2 tracking-tight uppercase italic leading-tight">
          {goal.title}
        </h4>
        
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6 truncate">
           Targeting: {courseName || "Custom Objective"}
        </p>

        <div className="relative h-1.5 w-full bg-zinc-900/50 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FFC371] to-[#2ecc71] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}