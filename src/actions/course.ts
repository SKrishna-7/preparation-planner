"use server";

import { db } from "../../lib/prisma"; // Ensure your path to db is correct
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// 1. GET ALL COURSES (Filtered by User)
export async function getCourses() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const courses = await db.course.findMany({
      where: { userId: userId }, // CRITICAL: Only get your own data
      include: {
        modules: {
          include: { topics: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return courses.map(course => {
      let totalTopics = 0;
      let completedTopics = 0;

      course.modules.forEach(mod => {
        totalTopics += mod.topics.length;
        completedTopics += mod.topics.filter(t => t.isCompleted).length;
      });

      const progress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);
      
      return {
        ...course,
        progress,
        totalModules: course.modules.length,
        completedModules: course.modules.filter(m => m.status === 'completed').length,
      };
    });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

// 2. CREATE A COURSE (Linked to User)
export async function createCourseAction(
  title: string, 
  description: string, 
  startDateStr: string, 
  endDateStr: string    
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    await db.course.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        userId, // <--- LINK TO CLERK USER
        progress: 0,
        color: "bg-blue-500", 
        icon: "📚",
      },
    });

    revalidatePath("/courses");
    revalidatePath("/"); // Also update dashboard
    return { success: true };

  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return { success: false };
  }
}

// 3. DELETE (With User check)
export async function deleteCourseAction(courseId: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    await db.course.delete({
      where: {
        id: courseId,
        userId: userId // CRITICAL: Prevent deleting other people's courses
      },
    });

    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("DELETE COURSE ERROR:", error);
    return { success: false };
  }
} 

// 4. UPDATE (With User check)
export async function updateCourseAction(
  courseId: string, 
  title: string, 
  description: string, 
  startDateStr: string, 
  endDateStr: string
) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    await db.course.update({
      where: { 
        id: courseId,
        userId: userId // Security check
      },
      data: {
        title,
        description,
        startDate,
        endDate,
      },
    });

    revalidatePath("/courses");
    return { success: true };
  } catch (error) {
    console.error("UPDATE COURSE ERROR:", error);
    return { success: false };
  }
}