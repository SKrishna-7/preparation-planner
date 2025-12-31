"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// 1. GET TOPIC DATA (Secured via Ownership Chain)
export async function getTopicDetails(topicId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    // We verify ownership by checking the course userId through the module
    const topic = await db.topic.findFirst({
      where: { 
        id: topicId,
        module: {
          course: { userId: userId } // Security Gate
        }
      },
      include: {
        module: {
          include: {
            course: true 
          }
        }
      }
    });
    return topic;
  } catch (error) {
    console.error("GET_TOPIC_ERROR:", error);
    return null;
  }
}

// 2. SAVE NOTE (Secured)
export async function saveNoteAction(topicId: string, content: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    // updateMany is used to ensure the topic belongs to the user
    await db.topic.updateMany({
      where: { 
        id: topicId,
        module: { course: { userId } } 
      },
      data: { note: content }
    });
  } catch (error) {
    console.error("SAVE_NOTE_ERROR:", error);
  }
}

// 3. SAVE RESOURCE (Secured)
export async function saveResourceAction(topicId: string, url: string, mode: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    await db.topic.updateMany({
      where: { 
        id: topicId,
        module: { course: { userId } } 
      },
      data: { 
        resourceUrl: url,
        resourceMode: mode
      }
    });
    revalidatePath(`/learn/${topicId}`);
  } catch (error) {
    console.error("SAVE_RESOURCE_ERROR:", error);
  }
}

// 4. MARK COMPLETE (Secured)
export async function completeTopicAction(topicId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    await db.topic.updateMany({
      where: { 
        id: topicId,
        module: { course: { userId } } 
      },
      data: { isCompleted: true }
    });
    
    revalidatePath(`/courses`); 
    revalidatePath(`/learn/${topicId}`);
  } catch (error) {
    console.error("COMPLETE_TOPIC_ERROR:", error);
  }
}