// "use client";

// import { useState, useEffect, useCallback } from "react";
// import {
//   Calendar as CalendarIcon, ChevronLeft, ChevronRight,
//   Plus, X, Trash2, Loader2, Check
// } from "lucide-react";

// import { useAuth } from "@clerk/nextjs";

// // FIXED: Adjusted import to match standard tsconfig paths
// import {
//   getPlannerEvents,
//   addPlannerEvent,
//   deletePlannerEvent,
//   toggleEventStatus
// } from "@actions/planner";

// // --- TYPES ---
// type EventType = "Class" | "Study" | "Test" | "Break" | "Meeting";

// interface ScheduleEvent {
//   id: string;
//   title: string;
//   subtitle: string | null; // Changed from string to string | null
//   startTime: string;
//   type: string;
//   date: string;
//   completed: boolean;
// }
// export function PlannerWidget() {
//   const [events, setEvents] = useState<ScheduleEvent[]>([]);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSyncing, setIsSyncing] = useState(false); //
//   const { isLoaded, userId } = useAuth();
//   const [isLoading, setIsLoading] = useState(true);

//   // Modal Form State
//   const [newTitle, setNewTitle] = useState("");
//   const [newSubtitle, setNewSubtitle] = useState("");
//   const [newTime, setNewTime] = useState("");
//   const [newType, setNewType] = useState<EventType>("Study");

//   // 1. DATA FETCHING
//   const loadEvents = useCallback(async () => {
//     // Always check userId inside the function, not in the dependency array logic
//     if (!userId) {
//       setEvents([]);
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const data = await getPlannerEvents();
//       setEvents(data || []);
//     } catch (error) {
//       console.error("Failed to load events", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]); // Only depend on userId

//   useEffect(() => {
//     // Use a simple check here. The array size [isLoaded, loadEvents] 
//     // will now never change regardless of auth state.
//     if (isLoaded) {
//       loadEvents();
//     }
//   }, [isLoaded, loadEvents]);
//   // --- ACTIONS ---

//   const handleToggle = async (id: string, currentStatus: boolean) => {
//     // Optimistic UI update
//     setEvents(prev => prev.map(e => e.id === id ? { ...e, completed: !currentStatus } : e));
//     try {
//       await toggleEventStatus(id, !currentStatus);
//     } catch (error) {
//       // Revert on error if necessary
//       await loadEvents();
//     }
//   };

//   const handleAdd = async () => {
//     if (!newTitle.trim() || !newTime) return;
//     setIsSubmitting(true);
//     setIsSyncing(true); // Start local loader
//     try {
//       const res = await addPlannerEvent({
//         title: newTitle,
//         subtitle: newSubtitle || newType,
//         startTime: newTime,
//         type: newType,
//         date: currentDate.toDateString()
//       });

//       if (res.success) {
//         await loadEvents();
//         setIsModalOpen(false);
//         resetForm();
//       }
//     } catch (error) {
//       console.error("Add failed", error);
//     } finally {
//       setIsSubmitting(false);
//     }
//     setIsSyncing(false);
//   };

//   const handleDelete = async (id: string) => {
//     setEvents(prev => prev.filter(e => e.id !== id));
//     try {
//       await deletePlannerEvent(id);
//     } catch (error) {
//       await loadEvents();
//     }
//   };

//   const resetForm = () => {
//     setNewTitle("");
//     setNewSubtitle("");
//     setNewTime("");
//     setNewType("Study");
//   };

//   const changeDate = (days: number) => {
//     const newDate = new Date(currentDate);
//     newDate.setDate(newDate.getDate() + days);
//     setCurrentDate(newDate);
//   };

//   const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

//   // Filter and Sort: Ensures chronological order
//   const dailyEvents = events
//     .filter(e => e.date === currentDate.toDateString())
//     .sort((a, b) => a.startTime.localeCompare(b.startTime));

//   const getTypeStyles = (type: string, isCompleted: boolean) => {
//     if (isCompleted) return 'bg-zinc-100 border-zinc-100 text-zinc-950 dark:bg-white dark:border-white dark:text-black';

//     switch (type) {
//       case 'Study': return 'border-indigo-500 text-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
//       case 'Class': return 'border-blue-500 text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
//       case 'Meeting': return 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
//       case 'Test': return 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
//       case 'Break': return 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
//       default: return 'border-zinc-700 text-zinc-500 bg-zinc-800';
//     }
//   };

//   if (!isLoaded || isLoading) return (
//     <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] min-h-[300px]">
//       <Loader2 className="animate-spin text-zinc-500" size={24} />
//     </div>
//   );

//   return (
//     <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col backdrop-blur-md">
//       {/* ... (Your existing Header & Timeline rendering logic remains perfect) ... */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h3 className="text-lg font-bold text-white tracking-tight">Today's Schedule</h3>
//           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Focus Mode</p>
//         </div>
//         <div className="flex items-center gap-1 bg-black border border-zinc-800 p-1 rounded-xl shadow-inner">
//           <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
//             <ChevronLeft size={14} />
//           </button>
//           <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest px-2 min-w-[80px] text-center">
//             {formattedDate}
//           </span>
//           <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
//             <ChevronRight size={14} />
//           </button>
//         </div>
//       </div>

//       <div className="relative flex-1 space-y-8 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-800 before:via-zinc-800 before:to-transparent">
        
//         {isSyncing && (
//         <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm rounded-[2.5rem] flex items-center justify-center animate-in fade-in">
//           <div className="flex flex-col items-center gap-2">
//             <Loader2 className="animate-spin text-zinc-500" size={20} />
//             <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Updating Schedule</span>
//           </div>
//         </div>
//       )}
        
//         {dailyEvents.length === 0 ? (
//           <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
//             <CalendarIcon size={32} className="mb-2 text-zinc-600" />
//             <p className="text-xs italic text-zinc-500">No events found.</p>
//           </div>
//         ) : dailyEvents.map((event) => (
//           <div key={event.id} className="relative pl-8 group animate-in fade-in slide-in-from-left-2 duration-300">
//             <button
//               onClick={() => handleToggle(event.id, event.completed)}
//               className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-black ${getTypeStyles(event.type, event.completed)}`}
//             >
//               {event.completed ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
//             </button>
//             <div className="flex justify-between items-start">
//               <div className={`flex flex-col ${event.completed ? 'opacity-40' : ''}`}>
//                 <div className="flex items-center gap-2 mb-0.5">
//                   <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{event.startTime}</span>
//                   <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-zinc-800 text-zinc-500">{event.type}</span>
//                 </div>
//                 <h4 className={`text-sm font-bold ${event.completed ? 'line-through decoration-2 text-zinc-500' : 'text-zinc-100'}`}>{event.title}</h4>
//                 <span className="text-[10px] font-bold text-zinc-600 mt-0.5">
//                   {event.subtitle ?? ""}
//                 </span>              </div>
//               <button onClick={() => handleDelete(event.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-700 hover:text-rose-500 transition-all">
//                 <Trash2 size={14} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="w-full mt-10 py-4 bg-zinc-800/50 hover:bg-zinc-100 hover:text-black border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2"
//       >
//         <Plus size={14} /> Plan New Block
//       </button>

//       {/* MODAL (Keep as you have it) */}
//       {isModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
//           <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95">
//             <div className="flex justify-between items-center mb-8">
//               <h3 className="text-xl font-bold text-white">New Block</h3>
//               <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
//             </div>
//             <div className="space-y-5">
//               <div className="grid grid-cols-3 gap-2">
//                 {['Study', 'Class', 'Meeting', 'Test', 'Break'].map(type => (
//                   <button key={type} onClick={() => setNewType(type as EventType)} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${newType === type ? 'bg-zinc-100 border-white text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{type}</button>
//                 ))}
//               </div>
//               <input type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none [color-scheme:dark]" value={newTime} onChange={e => setNewTime(e.target.value)} />
//               <input type="text" placeholder="Title" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
//               <input type="text" placeholder="Details" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none" value={newSubtitle} onChange={e => setNewSubtitle(e.target.value)} />
//               <button onClick={handleAdd} disabled={isSubmitting || !newTitle.trim() || !newTime} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">
//                 {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : 'Add to Schedule'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }













"use client";

import { useState } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, X, Trash2, Loader2, Check 
} from "lucide-react";

import { 
  addPlannerEvent, 
  deletePlannerEvent, 
  toggleEventStatus 
} from "@actions/planner";

type EventType = "Class" | "Study" | "Test" | "Break" | "Meeting";
import { useEffect } from "react";

// Accept props from the Dashboard
type PlannerWidgetProps = {
  events: any[];
  optimisticUpdate: (updater: (events: any[]) => any[]) => void;
  handleUpdate: (action: () => Promise<any>) => void;
};

export function PlannerWidget({
  events,
  optimisticUpdate,
  handleUpdate,
}: PlannerWidgetProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newType, setNewType] = useState<EventType>("Study");

  // --- ACTIONS USING THE GLOBAL handleUpdate ---
  const [localEvents, setLocalEvents] = useState(events ?? []);

  useEffect(() => {
  setLocalEvents(events ?? []);
}, [events]);

const onDelete = (id: string) => {
  handleUpdate(() => deletePlannerEvent(id));
};

  const onAdd = async () => {
    if (!newTitle.trim() || !newTime) return;
    
  

    handleUpdate(async () => {
      const res = await addPlannerEvent({
        title: newTitle,
        subtitle: newSubtitle || newType,
        startTime: newTime,
        type: newType,
        date: currentDate.toDateString()
      });
      if (res.success) {
        setIsModalOpen(false);
        resetForm();
      }
    });
  };

  const resetForm = () => {
    setNewTitle("");
    setNewSubtitle("");
    setNewTime("");
    setNewType("Study");
  };

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const formattedDate = currentDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  // Filter chronologically for the selected date
  const dailyEvents = localEvents
    .filter(e => e.date === currentDate.toDateString())
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getTypeStyles = (type: string, isCompleted: boolean) => {
    if (isCompleted) return 'bg-white border-white text-black';
    switch (type) {
      case 'Study': return 'border-indigo-500 text-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]';
      case 'Class': return 'border-blue-500 text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
      case 'Meeting': return 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
      case 'Test': return 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.2)]';
      case 'Break': return 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
      default: return 'border-zinc-700 text-zinc-500 bg-zinc-800';
    }
  };
const onToggle = async (id: string, currentStatus: boolean) => {
  // ⚡ instant UI update (0ms)
  optimisticUpdate(prev =>
    prev.map(e =>
      e.id === id ? { ...e, completed: !currentStatus } : e
    )
  );

  try {
    // 🔁 background server sync
    await toggleEventStatus(id, !currentStatus);
  } catch (err) {
    // ❌ rollback if server fails
    optimisticUpdate(prev =>
      prev.map(e =>
        e.id === id ? { ...e, completed: currentStatus } : e
      )
    );
  }
};


  return (
    <section className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col backdrop-blur-md">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Schedule</h3>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Focus Mode</p>
        </div>
        <div className="flex items-center gap-1 bg-black border border-zinc-800 p-1 rounded-xl">
          <button onClick={() => changeDate(-1)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest px-2 min-w-[80px] text-center">
            {formattedDate}
          </span>
          <button onClick={() => changeDate(1)} className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="relative flex-1 space-y-8 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-800 before:via-zinc-800 before:to-transparent">
        {dailyEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center">
            <CalendarIcon size={32} className="mb-2 text-zinc-600" />
            <p className="text-xs italic text-zinc-500">No entries</p>
          </div>
        ) : dailyEvents.map((event) => (
          <div key={event.id} className="relative pl-8 group animate-in fade-in slide-in-from-left-2 duration-300">
            <button
              onClick={() => onToggle(event.id, event.completed)}
              className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 bg-black ${getTypeStyles(event.type, event.completed)}`}
            >
              {event.completed ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-30" />}
            </button>
            <div className="flex justify-between items-start">
              <div className={`flex flex-col ${event.completed ? 'opacity-40' : ''}`}>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{event.startTime}</span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border border-zinc-800 text-zinc-500">{event.type}</span>
                </div>
                <h4 className={`text-sm font-bold ${event.completed ? 'line-through decoration-2 text-zinc-500' : 'text-zinc-100'}`}>{event.title}</h4>
                {event.subtitle && <span className="text-[10px] font-bold text-zinc-600 mt-0.5">{event.subtitle}</span>}
              </div>
              <button onClick={() => onDelete(event.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-700 hover:text-rose-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full mt-10 py-4 bg-zinc-800/50 hover:bg-zinc-100 hover:text-black border border-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Plan New Block
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-white">New Block</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-2">
                {['Study', 'Class', 'Meeting', 'Test', 'Break'].map(type => (
                  <button key={type} onClick={() => setNewType(type as EventType)} className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${newType === type ? 'bg-zinc-100 border-white text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{type}</button>
                ))}
              </div>
              <input type="time" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none [color-scheme:dark]" value={newTime} onChange={e => setNewTime(e.target.value)} />
              <input type="text" placeholder="Title" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              <input type="text" placeholder="Details" className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none" value={newSubtitle} onChange={e => setNewSubtitle(e.target.value)} />
              <button onClick={onAdd} disabled={!newTitle.trim() || !newTime} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50">
                Add to Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}