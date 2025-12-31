"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// 1. GET BOARD DATA (Isolated Tasks)
export async function getBoardData() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    // Fetch columns but ONLY include tasks belonging to the current user
    let columns = await db.taskColumn.findMany({
      include: {
        tasks: {
          where: { userId }, // DATA ISOLATION
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Seed default columns if none exist (Global structure)
    if (columns.length === 0) {
      await db.taskColumn.createMany({
        data: [
          { title: "Todo", order: 0 },
          { title: "In Progress", order: 1 },
          { title: "Done", order: 2 }
        ],
        skipDuplicates: true,
      });
      
      columns = await db.taskColumn.findMany({
        include: { tasks: { where: { userId } } },
        orderBy: { order: 'asc' }
      });
    }

    return columns;
  } catch (error) {
    console.error("KANBAN_GET_ERROR:", error);
    return [];
  }
}

// 2. CREATE TASK (Linked to User)
export async function createTaskAction(content: string, columnId: string, priority: string = "medium") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const count = await db.task.count({ 
      where: { columnId, userId } 
    });
    
    await db.task.create({
      data: {
        content,
        columnId,
        order: count,
        priority,
        userId // CRITICAL: Link to owner
      }
    });
    
    revalidatePath("/tasks");
    revalidatePath("/"); // Update dashboard summary
  } catch (error) {
    console.error("TASK_CREATE_ERROR:", error);
  }
}

// 3. MOVE TASK (Ownership Verified)
export async function moveTaskAction(taskId: string, newColumnId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    // Use updateMany to ensure only the owner can move the task
    await db.task.updateMany({
      where: { 
        id: taskId, 
        userId 
      },
      data: { columnId: newColumnId }
    });
    
    revalidatePath("/tasks");
  } catch (error) {
    console.error("TASK_MOVE_ERROR:", error);
  }
}

// 4. DELETE TASK (Ownership Verified)
export async function deleteTaskAction(taskId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    await db.task.deleteMany({ 
      where: { id: taskId, userId } 
    });
    
    revalidatePath("/tasks");
  } catch (error) {
    console.error("TASK_DELETE_ERROR:", error);
  }
}

// 5. UPDATE PRIORITY (Ownership Verified)
export async function updatePriorityAction(taskId: string, priority: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    await db.task.updateMany({
      where: { id: taskId, userId },
      data: { priority }
    });
    
    revalidatePath("/tasks");
  } catch (error) {
    console.error("TASK_PRIORITY_ERROR:", error);
  }
}