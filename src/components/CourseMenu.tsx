// components/CourseMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react";
import { deleteCourseAction } from "@actions/course";

interface CourseMenuProps {
  courseId: string;
  onDeleteSuccess: (id: string) => void;
  onEdit: () => void; 
}   

// 👇 FIX: You were missing 'onEdit' inside these curly braces
export function CourseMenu({ courseId, onDeleteSuccess, onEdit }: CourseMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the card link
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this course?")) return;

    setIsDeleting(true);
    const result = await deleteCourseAction(courseId);
    
    if (result.success) {
      onDeleteSuccess(courseId); // Tell parent to remove from list
    } else {
      alert("Failed to delete course");
    }
    setIsDeleting(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        disabled={isDeleting}
        className="text-text-muted hover:text-text-primary p-1 hover:bg-surface-highlight rounded-lg transition-colors"
      >
        {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <MoreHorizontal size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-40 bg-surface border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <button 
            onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               setIsOpen(false);
               onEdit(); // Now this will work because 'onEdit' is defined above
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-highlight hover:text-text-primary transition-colors text-left"
          >
            <Edit size={16} /> Edit
          </button>
          
          <button 
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}