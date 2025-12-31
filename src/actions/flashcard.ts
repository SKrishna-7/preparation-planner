"use server";

import { db } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

// --- DECKS (LIBRARY) ---
export async function getDecks() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const decks = await db.deck.findMany({
      where: { userId }, // DATA ISOLATION
      include: {
        cards: true
      },
      orderBy: { title: 'asc' }
    });

    return decks.map(deck => ({
      ...deck,
      totalCards: deck.cards.length,
      masteredCards: deck.cards.filter(c => c.mastery === 'easy').length
    }));
  } catch (error) {
    console.error("GET_DECKS_ERROR:", error);
    return [];
  }
}

export async function createDeckAction(title: string, description: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const colors = ["bg-purple-500", "bg-blue-500", "bg-orange-500", "bg-pink-500", "bg-green-500"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    await db.deck.create({
      data: {
        title,
        description,
        color: randomColor,
        userId // CRITICAL: Link to owner
      }
    });
    revalidatePath("/flashcards");
  } catch (error) {
    console.error("CREATE_DECK_ERROR:", error);
  }
}

export async function deleteDeckAction(deckId: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.deck.deleteMany({ 
    where: { 
      id: deckId, 
      userId 
    } 
  });
  revalidatePath("/flashcards");
}

// --- CARDS (PLAYER) ---
export async function getDeckDetails(deckId: string) {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    return await db.deck.findFirst({
      where: { 
        id: deckId, 
        userId 
      },
      include: {
        cards: true
      }
    });
  } catch (error) {
    return null;
  }
}

export async function createFlashcardAction(deckId: string, front: string, back: string) {
  try {
    const { userId } = await auth();
    if (!userId) return;

    // Verify user owns the deck before adding cards
    const deckOwner = await db.deck.findFirst({ where: { id: deckId, userId }});
    if (!deckOwner) return;

    await db.flashcard.create({
      data: {
        front,
        back,
        deckId,
        mastery: 'new'
      }
    });
    revalidatePath(`/flashcards/${deckId}`);
  } catch (error) {
    console.error("CREATE_CARD_ERROR:", error);
  }
}

export async function deleteFlashcardAction(cardId: string, deckId: string) {
  const { userId } = await auth();
  if (!userId) return;

  // Security: Traversal check to ensure card's deck belongs to user
  await db.flashcard.deleteMany({
    where: { 
      id: cardId,
      deck: { userId } 
    }
  });
  revalidatePath(`/flashcards/${deckId}`);
}

export async function updateMasteryAction(cardId: string, mastery: string, deckId: string) {
  const { userId } = await auth();
  if (!userId) return;

  await db.flashcard.updateMany({
    where: { 
      id: cardId,
      deck: { userId } 
    },
    data: { mastery }
  });
  revalidatePath(`/flashcards/${deckId}`);
}