// src/lib/activity-logger.ts
import { db } from "@lib/prisma";

/**
 * Increments the activity count for a user for the current day.
 * Uses an upsert with a unique composite ID to prevent duplicate records for the same day.
 */
export async function trackActivity(userId: string, incrementBy: number = 1) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Unique ID format: activity_clerkId_YYYY-MM-DD
  const dateString = today.toISOString().split('T')[0];
  const activityId = `activity_${userId}_${dateString}`;

  return await db.activity.upsert({
    where: { id: activityId },
    update: { count: { increment: incrementBy } },
    create: {
      id: activityId,
      userId: userId,
      date: today,
      count: incrementBy,
    },
  });
}