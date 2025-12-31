// "use server";

// import { db } from "@/lib/prisma";

// export async function getDashboardStats() {
//   try {
//     // 1. Fetch all Courses with nested Modules and Topics to calculate real-time progress
//     const allCourses = await db.course.findMany({
//       include: {
//         modules: {
//           include: { topics: true },
//           orderBy: { id: 'asc' } 
//         }
//       },
//       orderBy: { updatedAt: 'desc' },
//     });

//     // 2. Fetch Active Goals from the Goal model
//     // Note: The Goal model in your schema uses 'target' and 'type' fields.
//     const goals = await db.goal.findMany({
//       where: { isDone: false },
//       orderBy: { createdAt: 'desc' },
//       take: 4 
//     });

//     // 3. Transform Courses to calculate live progress and find the active module
//     const transformedCourses = allCourses.map(course => {
//       let totalTopics = 0;
//       let completedTopics = 0;

//       // Identify the most relevant module (In-progress > Pending > First)
//       const currentModule = 
//         course.modules.find(m => m.status === 'in-progress') || 
//         course.modules.find(m => m.status === 'pending') || 
//         course.modules[0];

//       const currentModuleName = currentModule?.title || "Course Introduction";

//       // Calculate progress based on Topic completion rather than static fields
//       course.modules.forEach(mod => {
//         totalTopics += mod.topics.length;
//         completedTopics += mod.topics.filter(t => t.isCompleted).length;
//       });

//       const calculatedProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

//       return {
//         ...course,
//         progress: calculatedProgress,
//         currentModuleName, 
//         totalModules: course.modules.length,
//         // Completed modules are determined by their status field
//         completedModules: course.modules.filter(m => m.status === 'completed').length
//       };
//     });

//     // 4. Categorize data for the UI sections
//     const activeCourses = transformedCourses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 4);
    
//     // Ensure recentCourse is the most recently updated one
//     const recentCourse = transformedCourses.length > 0 ? transformedCourses[0] : null;

//     // 5. Fetch Daily Tasks (Optional but recommended for a full dashboard)
//     const dailyTasks = await db.task.findMany({
//       where: {
//         column: { title: "Todo" }
//       },
//       take: 3
//     });

//     return {
//       user: { name: "Suresh Krishnan S", streak: 14 },
//       activeCourses,
//       recentCourse,
//       goals,
//       dailyTasks
//     };
//   } catch (error) {
//     console.error("GET_DASHBOARD_STATS_ERROR:", error);
//     return null;
//   }
// }



"use server"; 
import { db } from "../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
export async function getDashboardStats() {
  try {
    // 1. Identify the Current User
    const { userId } = await auth();
    const userObject = await currentUser();
    // If no user is logged in, return null (Middleware usually prevents this anyway)
    if (!userId) return null;


    const user = await db.user.upsert({
      where: { clerkId: userId },
      update: {
        name: `${userObject?.firstName} ${userObject?.lastName}`,
        imageUrl: userObject?.imageUrl,
      },
      create: {
        clerkId: userId,
        email: userObject?.emailAddresses[0].emailAddress || "",
        name: `${userObject?.firstName} ${userObject?.lastName}`,
        imageUrl: userObject?.imageUrl,
        plan: "PRO", // Defaulting you to PRO for testing
      },
    });
    // 2. Fetch ONLY this user's Courses
    const allCourses = await db.course.findMany({
      where: { userId: userId },
      include: {
        modules: { include: { topics: true }, orderBy: { id: 'asc' } }
      },
      orderBy: { updatedAt: 'desc' },
    });

    // 3. Fetch ONLY this user's Goals
    const goals = await db.goal.findMany({
      where: { 
        userId: userId, // DATA ISOLATION FILTER
        isDone: false 
      },
      orderBy: { createdAt: 'desc' },
      take: 4 
    });

    // --- TRANSFORMATION LOGIC (Keep as you had it) ---
    const transformedCourses = allCourses.map(course => {
      let totalTopics = 0;
      let completedTopics = 0;

      const currentModule = 
        course.modules.find(m => m.status === 'in-progress') || 
        course.modules.find(m => m.status === 'pending') || 
        course.modules[0];

      const currentModuleName = currentModule?.title || "Course Introduction";

      course.modules.forEach(mod => {
        totalTopics += mod.topics.length;
        completedTopics += mod.topics.filter(t => t.isCompleted).length;
      });

      const calculatedProgress = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

      return {
        ...course,
        progress: calculatedProgress,
        currentModuleName, 
        totalModules: course.modules.length,
        completedModules: course.modules.filter(m => m.status === 'completed').length
      };
    });

    const activeCourses = transformedCourses.filter(c => c.progress > 0 && c.progress < 100).slice(0, 4);
    const recentCourse = transformedCourses.length > 0 ? transformedCourses[0] : null;

    // 4. Fetch ONLY this user's Daily Tasks
    const dailyTasks = await db.task.findMany({
      where: {
        userId: userId, // DATA ISOLATION FILTER
        column: { title: "Todo" }
      },
      take: 3
    });

    return {
      activeCourses,
      recentCourse,
      goals,
      dailyTasks
    };
  } catch (error) {
    console.error("GET_DASHBOARD_STATS_ERROR:", error);
    return null;
  }
}