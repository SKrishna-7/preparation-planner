"use client";

import { useState, useTransition, useEffect } from "react";
import { createStrategicGoal } from "@actions/goals";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@uicomponents/ui/dialog";
import { Button } from "@uicomponents/ui/button";
import { Input } from "@uicomponents/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@uicomponents/ui/select";
import { Label } from "@uicomponents/ui/label";
import { Target, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateGoalDialog({ activeCourses, onSuccess, children }: any) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Reset internal state when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedCourseId(null);
      setSelectedModuleId(null);
    }
  }, [open]);

  const selectedCourse = activeCourses.find((c: any) => c.id === selectedCourseId);

  async function handleFormSubmit(formData: FormData) {
    const targetType = selectedModuleId ? 'MODULE' : selectedCourseId ? 'COURSE' : 'CUSTOM';
    const targetId = selectedModuleId || selectedCourseId || "";

    startTransition(async () => {
      try {
        await createStrategicGoal({
          title: formData.get("title") as string,
          type: formData.get("type") as 'weekly' | 'monthly',
          category: targetType as any,
          targetId: targetId,
          deadline: new Date(formData.get("deadline") as string),
          color: formData.get("type") === 'weekly' ? 'indigo' : 'emerald',
        });
        
        // 1. Force Next.js to re-sync server data
        router.refresh(); 
        
        // 2. UI cleanup
        setOpen(false);
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Failed to create goal:", error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300">
            + Initialize Objective
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] rounded-[2rem] overflow-hidden">
        
        {/* SYNCING LOADER OVERLAY */}
        {isPending && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
              Calculating Trajectory...
            </span>
          </div>
        )}

        <DialogHeader>
          <DialogTitle className="text-xl font-bold italic flex items-center gap-2">
            <Target className="text-indigo-500" size={20} /> Set Strategic Goal
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            Define your performance metrics.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleFormSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500">Goal Title</Label>
            <Input 
              name="title" 
              required 
              placeholder="e.g., Master Backend Fundamentals" 
              className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Trajectory</Label>
              <Select name="type" defaultValue="weekly">
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="weekly">Weekly Sprint</SelectItem>
                  <SelectItem value="monthly">Monthly Marathon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Deadline</Label>
              <Input 
                name="deadline" 
                type="date" 
                required 
                className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500">Link to Course</Label>
            <Select onValueChange={(val) => { setSelectedCourseId(val); setSelectedModuleId(null); }}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500">
                <SelectValue placeholder="All-Access Goal" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                <SelectItem value="none">General Personal Goal</SelectItem>
                {activeCourses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourse && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Specific Module Focus</Label>
              <Select onValueChange={setSelectedModuleId}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-indigo-500">
                  <SelectValue placeholder="Entire Curriculum" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {selectedCourse.modules.map((mod: any) => (
                    <SelectItem key={mod.id} value={mod.id}>{mod.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full bg-white text-black font-black uppercase py-6 rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
          >
            {isPending ? "INITIALIZING..." : "Confirm Objective"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}