"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { syncGoalWithCourse } from "./goals";
import { auth } from "@clerk/nextjs/server";

// --- HELPERS ---
async function getValidatedUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized: Session missing");
  return userId;
}

// --- FETCH DATA ---
export async function getCourseDetails(courseId: string) {
  try {
    const userId = await getValidatedUserId();

    const course = await db.course.findFirst({
      where: { 
        id: courseId, 
        userId: userId // Security: Only fetch if owned by user
      },
      include: {
        modules: {
          include: {
            topics: { orderBy: { id: 'asc' } }
          },
          orderBy: { id: 'asc' }
        }
      }
    });

    const events = await db.event.findMany({
      where: { userId: userId },
      orderBy: { startTime: 'asc' }
    });

    return { course, events };
  } catch (error) {
    console.error("GET_COURSE_DETAILS_ERROR:", error);
    return { course: null, events: [] };
  }
}

// --- MODULE ACTIONS ---
export async function createModuleAction(courseId: string, title: string) {
  const userId = await getValidatedUserId();

  // Verify course ownership before creating a module
  const course = await db.course.findFirst({ where: { id: courseId, userId } });
  if (!course) throw new Error("Unauthorized");

  await db.module.create({
    data: { title, courseId, status: 'pending' }
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function updateModuleStatusAction(moduleId: string, status: string, courseId: string) {
  const userId = await getValidatedUserId();

  // Verify ownership via nested relation
  const module = await db.module.findFirst({
    where: { id: moduleId, course: { userId } }
  });
  if (!module) throw new Error("Unauthorized");

  await db.module.update({
    where: { id: moduleId },
    data: { status }
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteModuleAction(moduleId: string, courseId: string) {
  const userId = await getValidatedUserId();

  await db.module.deleteMany({
    where: { id: moduleId, course: { userId } }
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function renameModuleAction(moduleId: string, title: string, courseId: string) {
  const userId = await getValidatedUserId();

  await db.module.updateMany({
    where: { id: moduleId, course: { userId } },
    data: { title }
  });
  revalidatePath(`/courses/${courseId}`);
}

// --- TOPIC ACTIONS ---
export async function createTopicAction(moduleId: string, title: string, courseId: string) {
  const userId = await getValidatedUserId();

  // Security check: ensure the module belongs to a course owned by the user
  const module = await db.module.findFirst({
    where: { id: moduleId, course: { userId } }
  });
  if (!module) throw new Error("Unauthorized");

  await db.topic.create({
    data: { title, moduleId, duration: "15 min" }
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function toggleTopicFocusAction(topicId: string, isFocus: boolean, courseId: string) {
  const userId = await getValidatedUserId();

  await db.topic.updateMany({
    where: { id: topicId, module: { course: { userId } } },
    data: { isFocus }
  });
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteTopicAction(topicId: string, courseId: string) {
  const userId = await getValidatedUserId();

  await db.topic.deleteMany({
    where: { id: topicId, module: { course: { userId } } }
  });
  revalidatePath(`/courses/${courseId}`);
}

// --- PLANNER ACTIONS ---
export async function createEventAction(data: any, courseId: string) {
  const userId = await getValidatedUserId();

  await db.event.create({
    data: {
      title: data.title,
      subtitle: data.subtitle,
      startTime: data.startTime,
      date: data.date,
      type: data.type,
      isDone: false,
      userId: userId // Link to user
    }
  });
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/planner");
}

export async function deleteEventAction(eventId: string, courseId: string) {
  const userId = await getValidatedUserId();

  await db.event.deleteMany({
    where: { id: eventId, userId }
  });
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/planner");
}

export async function toggleEventAction(eventId: string, isDone: boolean, courseId: string) {
  const userId = await getValidatedUserId();

  await db.event.updateMany({
    where: { id: eventId, userId },
    data: { isDone }
  });
  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/planner");
}

export async function toggleTopicCompletionAction(topicId: string, isCompleted: boolean, courseId: string) {
  const userId = await getValidatedUserId();

  // Update the topic only if user owns the course chain
  await db.topic.updateMany({
    where: { id: topicId, module: { course: { userId } } },
    data: { isCompleted }
  });

  // Trigger goal synchronization
  await syncGoalWithCourse(courseId);

  revalidatePath("/"); 
  revalidatePath(`/courses/${courseId}`);
}