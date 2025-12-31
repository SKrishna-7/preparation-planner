"use client";

import { useState, useTransition } from "react";
import { createStrategicGoal } from "@actions/goals";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target, Loader2 } from "lucide-react";

export function CreateGoalDialog({ activeCourses, onSuccess, children }: any) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const selectedCourse = activeCourses.find((c: any) => c.id === selectedCourseId);

  async function handleFormSubmit(formData: FormData) {
    const targetType = selectedModuleId ? 'MODULE' : selectedCourseId ? 'COURSE' : 'CUSTOM';
    const targetId = selectedModuleId || selectedCourseId || "";

    startTransition(async () => {
      await createStrategicGoal({
        title: formData.get("title") as string,
        type: formData.get("type") as 'weekly' | 'monthly',
        category: targetType as any,
        targetId: targetId,
        deadline: new Date(formData.get("deadline") as string),
        color: formData.get("type") === 'weekly' ? 'indigo' : 'emerald',
      });
      setOpen(false);
      if (onSuccess) onSuccess();
      setSelectedCourseId(null);
      setSelectedModuleId(null);
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
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[425px] rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold italic flex items-center gap-2">
            <Target className="text-indigo-500" size={20} /> Set Strategic Goal
          </DialogTitle>
          <DialogDescription className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            Define your trajectory.
          </DialogDescription>
        </DialogHeader>
        
        <form action={handleFormSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500">Goal Title</Label>
            <Input name="title" required placeholder="e.g., Master System Design" className="bg-zinc-900 border-zinc-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Trajectory</Label>
              <Select name="type" defaultValue="weekly">
                <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectItem value="weekly">Weekly Sprint</SelectItem>
                  <SelectItem value="monthly">Monthly Marathon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Deadline</Label>
              <Input name="deadline" type="date" required className="bg-zinc-900 border-zinc-800" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-zinc-500">Select Course</Label>
            <Select onValueChange={(val) => { setSelectedCourseId(val); setSelectedModuleId(null); }}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="All Courses" /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {activeCourses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCourse && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-500">Focus on Module</Label>
              <Select onValueChange={setSelectedModuleId}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800"><SelectValue placeholder="Entire Course" /></SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                  {selectedCourse.modules.map((mod: any) => (
                    <SelectItem key={mod.id} value={mod.id}>{mod.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-white text-black font-black uppercase py-6 rounded-xl">
            {isPending ? <Loader2 className="animate-spin" /> : "Confirm Objective"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}