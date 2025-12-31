"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

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

    // Use updateMany to ensure ownership check
    const result = await db.scheduleEvent.updateMany({
      where: { 
        id, 
        userId // Security: User can only toggle their own events
      },
      data: { completed }
    });

    if (result.count === 0) return { success: false, error: "Event not found" };

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

    // deleteMany is safer as it won't crash if the record doesn't exist 
    // and naturally handles the userId ownership check.
    await db.scheduleEvent.deleteMany({
      where: { 
        id, 
        userId 
      }
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("FAILED_TO_DELETE_EVENT", error);
    return { success: false };
  }
}