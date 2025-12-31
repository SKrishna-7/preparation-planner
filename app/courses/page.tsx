"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, Plus, PlayCircle, 
  CheckCircle2, GraduationCap, Loader2, 
  X
} from "lucide-react";
import Link from "next/link";
// Make sure updateCourseAction is imported here
import { getCourses, createCourseAction, updateCourseAction } from "@actions/course"; 
import { CourseMenu } from "@components/CourseMenu"; 

// --- TYPES ---
interface Course {
  id: string;
  title: string;
  description: string | null;
  progress: number;
  totalModules: number;
  completedModules: number;
  lastAccessed: string;
  color: string;
  icon: string;
  startDate?: string | Date; // Added optional date types
  endDate?: string | Date;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // --- CREATE MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- EDIT MODAL STATE (NEW) ---
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Helper to remove course from list instantly
  const handleRemoveCourse = (deletedId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== deletedId));
  };

  // 1. Load Data
  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadData();
  }, []);

  // 2. Add Course
  const handleAddCourse = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);

    try {
      const result = await createCourseAction(newTitle, newDesc, startDate, endDate);

      if (result.success) {
        const updatedData = await getCourses();
        setCourses(updatedData);
        // Reset Form
        setNewTitle("");
        setNewDesc("");
        setStartDate("");
        setEndDate("");
        setIsModalOpen(false);
      } else {
        alert("Failed to create course.");
      }
    } catch (error) {
      console.error("CREATE ERROR:", error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Open Edit Modal (Pre-fill Data)
  const openEditModal = (course: Course) => {
    setEditTitle(course.title);
    setEditDesc(course.description || "");
    
    // Safely format dates for input type="date" (YYYY-MM-DD)
    const formatForInput = (dateVal: string | Date | undefined) => {
      if (!dateVal) return "";
      return new Date(dateVal).toISOString().split('T')[0];
    };

    setEditStartDate(formatForInput(course.startDate));
    setEditEndDate(formatForInput(course.endDate));
    
    setEditingCourse(course); // Triggers modal to open
  };

  // 4. Update Course
  const handleUpdateCourse = async () => {
    if (!editingCourse || !editTitle.trim()) return;
    setIsUpdating(true);

    try {
        const result = await updateCourseAction(
            editingCourse.id, 
            editTitle, 
            editDesc, 
            editStartDate, 
            editEndDate
        );

        if (result.success) {
            const updatedData = await getCourses();
            setCourses(updatedData);
            setEditingCourse(null); // Close modal
        } else {
            alert("Failed to update course");
        }
    } catch (error) {
        console.error("UPDATE ERROR", error);
    } finally {
        setIsUpdating(false);
    }
  };

  // Loading State
  if (!isLoaded) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary" />
    </div>
  );

  const activeCourse = courses.length > 0 ? courses[0] : null;

  return (
    <div className="h-full flex flex-col gap-8 p-2">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Courses</h1>
          <p className="text-text-secondary text-sm">Library of your active learning paths.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Create Course
          </button>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      {activeCourse && (
        <div className="relative overflow-hidden bg-gradient-to-r from-surface to-surface-highlight border border-border rounded-2xl p-8 shadow-sm group">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-accent-blue uppercase tracking-wider">
                <PlayCircle size={14} className="animate-pulse" /> Ready to Resume
              </div>
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-2">{activeCourse.title}</h2>
                <p className="text-text-secondary max-w-md">{activeCourse.description || "No description provided."}</p>
              </div>
              <div className="flex items-center gap-6 text-sm text-text-muted">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {activeCourse.completedModules}/{activeCourse.totalModules} Modules</span>
              </div>
            </div>

            <div className="w-full md:w-64 space-y-3">
              <div className="flex justify-between text-sm font-medium">
                 <span className="text-text-primary">Current Progress</span>
                 <span className="text-primary">{activeCourse.progress}%</span>
              </div>
              <div className="h-3 w-full bg-surface-highlight/50 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${activeCourse.color} rounded-full transition-all duration-1000`} 
                  style={{ width: `${activeCourse.progress}%` }} 
                />
              </div>
              <Link href={`/courses/${activeCourse.id}`} className="block w-full">
                <button className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                  Continue Learning
                </button>
              </Link>
            </div>
          </div>
          <GraduationCap size={300} className="absolute -right-10 -bottom-10 text-white/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        </div>
      )}

      {/* 3. COURSE GRID */}
      <div>
        <h3 className="font-semibold text-text-primary mb-6 flex items-center gap-2">
          <BookOpen size={20} className="text-text-muted" /> All Courses
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <div className="group h-full bg-surface border border-border rounded-2xl p-6 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col">
                
                <div className="flex justify-between items-start mb-6">
                  {/* Icon Box */}
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${course.color}/10 transition-colors`}>
                    <div className={`w-4 h-4 rounded-full ${course.color}`} />
                  </div>

                  {/* Menu with Edit Prop */}
                  <CourseMenu 
                    courseId={course.id} 
                    onDeleteSuccess={handleRemoveCourse} 
                    onEdit={() => openEditModal(course)} // <--- CONNECTING EDIT HERE
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4">
                    {course.description || "No description provided."}
                  </p>
                  
                  {(course.startDate || course.endDate) && (
                    <div className="flex flex-wrap gap-2 text-xs text-text-muted mb-4">
                       {course.startDate && <span>Start: {new Date(course.startDate).toLocaleDateString()}</span>}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex justify-between text-xs text-text-muted mb-2">
                    <span>{course.completedModules} / {course.totalModules} Topics</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${course.color} rounded-full transition-all duration-500`} 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* "Add New" Card */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="h-full min-h-[250px] border border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 text-text-muted hover:text-primary hover:border-primary hover:bg-surface-highlight/30 transition-all group"
          >
            <div className="w-16 h-16 rounded-full bg-surface-highlight group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus size={32} />
            </div>
            <span className="font-medium">Create New Course</span>
          </button>
        </div>
      </div>

      {/* 4. CREATE COURSE MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <form onSubmit={(e) => { e.preventDefault(); handleAddCourse(); }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">Create Course</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-text-primary p-1 hover:bg-surface-highlight rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Course Title <span className="text-red-500">*</span></label>
                  <input autoFocus type="text" required className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:border-primary transition-all" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Start Date</label>
                        <input type="date" className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary [color-scheme:dark] text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">End Date</label>
                        <input type="date" min={startDate} className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary [color-scheme:dark] text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary h-24 resize-none focus:outline-none focus:border-primary" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-highlight rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isSubmitting || !newTitle.trim()} className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : null} Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT COURSE MODAL (NEW) */}
      {editingCourse && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingCourse(null);
          }}
        >
          <div className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-200">
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateCourse(); }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-primary">Edit Course</h3>
                <button type="button" onClick={() => setEditingCourse(null)} className="text-text-secondary hover:text-text-primary p-1 hover:bg-surface-highlight rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Course Title <span className="text-red-500">*</span></label>
                  <input autoFocus type="text" required className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary focus:outline-none focus:border-primary transition-all" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Start Date</label>
                        <input type="date" className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary [color-scheme:dark] text-sm" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">End Date</label>
                        <input type="date" min={editStartDate} className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary [color-scheme:dark] text-sm" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} />
                    </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea className="w-full bg-surface-highlight border border-border rounded-xl p-3 text-text-primary h-24 resize-none focus:outline-none focus:border-primary" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-highlight rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={isUpdating || !editTitle.trim()} className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50">
                  {isUpdating ? <Loader2 size={16} className="animate-spin"/> : null} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}