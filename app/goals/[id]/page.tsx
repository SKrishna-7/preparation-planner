"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Target, Layers, TrendingUp, 
  History, Trash2, PlayCircle, CheckCircle2, Circle, Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@actions/dashboard";
import { deleteGoalAction } from "@actions/goals";

export default function GoalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoalData() {
      const stats = await getDashboardStats();
      setData(stats);
      setLoading(false);
    }
    loadGoalData();
  }, [id]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Initializing Trajectory...</div>;
  
  const goal = data?.goals.find((g: any) => g.id === id);
  if (!goal) return <div className="h-screen bg-black flex items-center justify-center text-zinc-700 uppercase tracking-widest">Objective Offline</div>;

  // --- PREDICTION LOGIC ---
  const itemsRemaining = goal.target - goal.current;
  const unitsPerWeek = 2.5; // Default velocity
  const weeksNeeded = itemsRemaining / unitsPerWeek;
  const estCompletionDate = new Date();
  estCompletionDate.setDate(estCompletionDate.getDate() + (weeksNeeded * 7));
  
  // Risk Assessment
  const isOverdueRisk = goal.deadline && estCompletionDate > new Date(goal.deadline);

  // Find linked course data
  const linkedCourse = data?.activeCourses.find((c: any) => 
    goal.category === 'COURSE' ? c.id === goal.targetId : c.modules.some((m: any) => m.id === goal.targetId)
  );

  const allUnits = linkedCourse?.modules.flatMap((m: any) => m.topics) || [];
  const progress = Math.round((goal.current / goal.target) * 100);

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 max-w-6xl mx-auto space-y-16 antialiased">
      
      {/* 1. NAVIGATION BAR */}
      <nav className="flex items-center justify-between border-b border-zinc-900 pb-8">
        <Link href="/" className="flex items-center gap-3 text-zinc-500 hover:text-zinc-200 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Trajectory Dashboard</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link 
            href={linkedCourse ? `/courses/${linkedCourse.id}` : "#"}
            className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <PlayCircle size={14} fill="black" /> Launch Course
          </Link>
          <button 
            onClick={async () => { if(confirm("Decommission Objective?")) { await deleteGoalAction(goal.id); router.push("/"); } }}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-all"
          >
            <Trash2 size={12} /> Decommission
          </button>
        </div>
      </nav>

      {/* 2. HEADER & PREDICTIVE METRICS */}
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <div className="inline-flex items-center px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500/80">
            Operational Objective
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase leading-[0.9] text-zinc-100">
            {goal.title}
          </h1>
          
          {/* Predictive Metric Card */}
          <div className={`p-6 bg-[#090909] border rounded-2xl flex flex-col justify-between transition-all max-w-sm
            ${isOverdueRisk ? 'border-red-900/50 ring-1 ring-red-500/10' : 'border-zinc-900'}`}>
            <div className="flex justify-between items-start mb-4">
              <Clock className={isOverdueRisk ? "text-red-500" : "text-zinc-600"} size={18} />
              {isOverdueRisk && (
                <span className="text-[8px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded animate-pulse flex items-center gap-1">
                  <AlertTriangle size={8} /> TRAJECTORY DELAY
                </span>
              )}
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Predicted Completion</p>
              <p className={`text-2xl font-black ${isOverdueRisk ? 'text-red-400' : 'text-zinc-100'}`}>
                {estCompletionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1">Based on {unitsPerWeek} units/week velocity</p>
            </div>
          </div>
        </div>

        {/* PROGRESS PANEL */}
        <div className="bg-[#090909] border border-zinc-900 rounded-[2rem] p-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-1">Trajectory Progress</span>
              <span className="text-5xl font-black tabular-nums tracking-tighter">{progress}%</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block mb-1">Cleared / Total</span>
              <span className="text-lg font-bold text-zinc-300">{goal.current} <span className="text-zinc-700">/ {goal.target}</span></span>
            </div>
          </div>
          <div className="relative h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FFC371] to-[#2ecc71] transition-all duration-[2s] ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      {/* 3. OPERATIONAL UNITS LIST */}
      <section className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <Target size={16} className="text-zinc-700" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Curriculum Unit Breakdown</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allUnits.map((topic: any) => (
            <div 
              key={topic.id} 
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between group
                ${topic.isCompleted 
                  ? 'bg-emerald-500/[0.03] border-emerald-500/20' 
                  : 'bg-[#090909] border-zinc-900 hover:border-zinc-800'}
              `}
            >
              <div className="flex items-center gap-4">
                {topic.isCompleted ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                )}
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-tight 
                    ${topic.isCompleted ? 'text-zinc-200' : 'text-zinc-500'}
                  `}>
                    {topic.title}
                  </h4>
                  <p className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-1">
                    {topic.duration || "15 min"} Est. Effort
                  </p>
                </div>
              </div>
              {topic.isCompleted && (
                <span className="text-[8px] font-black text-emerald-500/40 uppercase tracking-widest italic">Cleared</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 4. PERFORMANCE HISTORY */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <History size={16} className="text-zinc-700" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Maturity Event Log</h3>
        </div>
        <div className="bg-[#090909] border border-zinc-900 rounded-[2rem] overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin">
            {allUnits.filter((t: any) => t.isCompleted).map((unit: any, idx: number) => (
              <div key={unit.id} className="flex items-center justify-between p-5 border-b border-zinc-900/50 last:border-0 hover:bg-zinc-800/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <span className="text-xs font-bold text-zinc-200 tracking-tight uppercase italic">{unit.title} Cleared</span>
                </div>
                <span className="text-[8px] font-black text-zinc-800 uppercase tracking-widest">Sequence: {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}