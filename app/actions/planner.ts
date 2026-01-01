"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { trackActivity } from "./activity-logger";

export async function getPlannerEvents() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    return await db.scheduleEvent.findMany({
      where: { userId }, // Only fetch events for the logged-in user
      orderBy: { startTime: 'asc' }
    });
  } catch (error) {
    console.error("FAILED_TO_GET_EVENTS", error);
    return [];
  }
}

export async function addPlannerEvent(data: {
  title: string;
  subtitle: string;
  startTime: string;
  type: string;
  date: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const event = await db.scheduleEvent.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        startTime: data.startTime,
        type: data.type,
        date: data.date,
        completed: false,
        userId: userId // CRITICAL: Link to the authenticated user
      }
    });
    
    revalidatePath("/dashboard");
    revalidatePath("/planner"); // Also revalidate planner page if separate
    return { success: true, event };
  } catch (error) {
    console.error("FAILED_TO_ADD_EVENT", error);
    return { success: false };
  }
}
export async function toggleEventStatus(id: string, completed: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false };

    // Update the event
    const result = await db.scheduleEvent.update({
      where: { 
        id, 
        userId // Ensure ownership
      },
      data: { completed }
    });

    // TRIGGER: If the schedule block is marked as finished, increment activity
    if (completed) {
      await trackActivity(userId);
    }

    revalidatePath("/"); // Revalidate root for the heatmap
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("FAILED_TO_TOGGLE_EVENT", error);
    return { success: false };
  }
}

export async function deletePlannerEvent(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false };

    await db.scheduleEvent.deleteMany({
      where: { id, userId }
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("FAILED_TO_DELETE_EVENT", error);
    return { success: false };
  }
}

export async function toggleTaskStatus(taskId: string, isCompleted: boolean) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    await db.task.update({
      where: { id: taskId },
      data: { status: isCompleted ? "DONE" : "TODO" }
    });

    if (isCompleted) {
      await trackActivity(userId);
    }

    revalidatePath("/");
  } catch (error) {
    console.error("FAILED_TO_TOGGLE_TASK", error);
  }
}

