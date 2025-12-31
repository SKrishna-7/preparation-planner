"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  Plus, ArrowRight, Layers, Book, Loader2, Flame, BookOpen, Target, Clock, CheckCircle2, Play
} from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@actions/dashboard";
import { PlannerWidget } from "@components/PlannerWidget";
import { CreateGoalDialog } from "@components/AddGoalDialog";
import { GoalItem } from "@components/GoalItem";
import { getApplications } from "@actions/application"; 
import { StatsOverview } from "@components/StatsOverview";

import { ActivityHeatmap } from "@components/ActivityHeatmap";
import { useSearchParams } from "next/navigation";



export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [appCount, setAppCount] = useState(0); 

  useEffect(() => {
    loadStats();
  }, []);
  const searchParams = useSearchParams();
  // const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<{ msg: string; type: 'success' | 'info' } | null>(null);

useEffect(() => {
  const msg = searchParams.get("message");
  
  if (msg === "login-success") {
    setAuthStatus({ msg: "System Access Authorized: Welcome Suresh", type: 'success' });
    const timer = setTimeout(() => setAuthStatus(null), 4000);
    return () => clearTimeout(timer);
  }

  if (msg === "logout-success") {
    setAuthStatus({ msg: "Terminal Session Terminated", type: 'info' });
    const timer = setTimeout(() => setAuthStatus(null), 4000);
    return () => clearTimeout(timer);
  }
}, [searchParams]);
  const loadStats = async () => {
    const stats = await getDashboardStats();
    const jobs = await getApplications();
    setAppCount(jobs.length);
    setData(stats);
    setIsLoaded(true);
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (!isLoaded) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Loader2 size={32} className="animate-spin text-indigo-500 opacity-40" />
    </div>
  );
  const { recentCourse, goals, activeCourses } = data || {};
  const userName = 'Suresh Krishnan S';
  const streak = 14;

  const imminentGoal = goals
    ?.filter((g: any) => !g.isDone)
    .sort((a: any, b: any) => {
        const progressA = (a.current / a.target);
        const progressB = (b.current / b.target);
        return progressB - progressA;
    })[0];

    const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (90 - i));
    return d.toISOString().split('T')[0];
  });

  const activityData = {
    "2025-12-25": 1,
    "2025-12-28": 3,
    "2025-12-29": 2,
    // ... feed real data here
  };
  
  
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 antialiased relative bg-black text-white">
      
      {authStatus && (
  <div className="fixed top-6 right-6 z-[100] animate-in fade-in slide-in-from-right-8 duration-500">
    <div className={`
      flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl
      ${authStatus.type === 'success' 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400'}
    `}>
      {/* Visual Pulse Indicator */}
      <div className={`w-2 h-2 rounded-full animate-pulse ${authStatus.type === 'success' ? 'bg-emerald-500' : 'bg-zinc-500'}`} />
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1">
          {authStatus.type === 'success' ? 'Authorization Valid' : 'System Update'}
        </span>
        <span className="text-xs font-bold tracking-tight text-white italic">
          {authStatus.msg}
        </span>
      </div>
      
      {/* Decorative corner bracket (Cyber-Noir style) */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-40" />
    </div>
  </div>
)}

      {/* 1. HEADER - Standardized font sizes */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 w-full mb-10 pb-8 border-b border-zinc-800/50">
        <div>
          <h1 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Command Center</h1>
          <span className="text-2xl font-black text-white tracking-tight uppercase italic">{userName}</span>
        </div>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-2xl text-orange-500">
            <Flame size={18} fill="currentColor" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base text-zinc-100">{streak}</span>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Day Streak</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
            {userName[0]}
            </div>
        </div>
      </header>

      {/* 2. STATS OVERVIEW - Unified with command center spacing */}
      <StatsOverview 
        courseCount={activeCourses?.length || 0} 
        applicationCount={appCount} 
        imminentGoal={imminentGoal} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          
          {/* 3. CONTINUE LEARNING - Refined scaling */}
       {/* --- CONTINUE LEARNING HERO --- */}
<section>
  {recentCourse ? (
    <div className="relative bg-[#090909] border border-zinc-900 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl group">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="bg-zinc-800/50 border border-zinc-700/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-zinc-400">
              LEARNING TRACK
            </span>
            <span className="text-zinc-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Layers size={12} /> {recentCourse.totalModules || 0} MODULES TOTAL
            </span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase italic leading-none text-zinc-100">
            {recentCourse.title}
          </h2>
          <p className="text-zinc-500 text-xs max-w-xl font-medium leading-relaxed italic">
            Currently studying: {recentCourse.currentModuleName}
          </p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">CURRICULUM PROGRESS</span>
            <div className="text-3xl font-black">
              {Math.round(recentCourse.progress)} <span className="text-zinc-700 text-sm">/ 100%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">IN ACTIVE STUDY</div>
          </div>
        </div>

        <div className="relative h-2.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#FF5F6D] via-[#FFC371] to-[#2ecc71] transition-all duration-1000 shadow-[0_0_15px_rgba(46,204,113,0.2)]"
            style={{ width: `${recentCourse.progress}%` }}
          />
        </div>
      </div>

      {/* Footer: Modules Remaining & Bottom Right Button */}
      <div className="mt-10 pt-6 border-t border-zinc-900 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-500 border border-zinc-800">
            <BookOpen size={18} />
          </div>
          <div>
            <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">STATUS UPDATE</p>
            {/* DYNAMIC CALCULATION: Total Modules minus Completed Modules */}
            <p className="text-xs font-bold text-zinc-200">
              {recentCourse.totalModules - recentCourse.completedModules} Modules Remaining
            </p>
          </div>
        </div>

        {/* REPOSITIONED: Bottom Right Button */}
        <Link 
          href={`/courses/${recentCourse.id}`} 
          className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg"
        >
          <Play fill="black" size={14} /> Continue Learning
        </Link>
      </div>
    </div>
  ) : null}
</section>

          {/* 4. GOAL TRACKER - Professionalized font scale */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Target size={20} className="text-zinc-600" />
                {/* FIXED: Scaled down from 5xl to 2xl */}
                <h2 className="text-xl font-black tracking-tighter uppercase italic">GOAL TRACKER</h2>
              </div>
              <button className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">SEE HISTORY</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals?.map((goal: any) => {
                const linkedCourse = activeCourses?.find((c: any) => c.id === goal.targetId);
                return <GoalItem key={goal.id} goal={goal} courseName={linkedCourse?.title} onAction={loadStats} />;
              })}

              <CreateGoalDialog activeCourses={activeCourses || []} onSuccess={loadStats}>
                <div className="border-2 border-dashed border-zinc-900 rounded-[2rem] p-8 flex items-center justify-center cursor-pointer hover:border-zinc-800 hover:bg-zinc-900/10 transition-all group">
                  <span className="text-zinc-700 text-[10px] font-black uppercase tracking-widest group-hover:text-zinc-400">+ ADD NEW GOAL</span>
                </div>
              </CreateGoalDialog>
            </div>
          </section>
          <ActivityHeatmap activityData={activityData} />
        </div>

        {/* 5. PLANNER - Sticky positioning */}
        <div className="lg:col-span-4 h-fit sticky top-10">
           <PlannerWidget />
        </div>
      </div>
    </div>
  );
}