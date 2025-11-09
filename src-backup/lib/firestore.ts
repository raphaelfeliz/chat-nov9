/*
*file-summary*
PATH: src/lib/firestore.ts
PURPOSE: Provide a typed abstraction layer for Firestore operations used by the chat and configurator subsystems.
SUMMARY: Defines deterministic ID generation for messages and implements Firestore read/write helpers (`saveMessage`, `loadSession`)
         to manage chat data under `/chats/{sessionId}/messages/{messageId}`. Uses batched writes for consistency and
         server timestamps for authoritative ordering. Supports offline caching transparently via Firestore’s persistence layer.
IMPORTS: ./firebase (db instance), firebase/firestore (collection, doc, query, orderBy, setDoc, writeBatch, serverTimestamp)
EXPORTS: buildMessageId(), saveMessage(), loadSession()
*/


// src/lib/firestore.ts
import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";

/** Build deterministic message ID: sessionId-<epochMillis>-<sender> */
export function buildMessageId(sessionId: string, timestamp: number, sender: string) {
  return `${sessionId}-${timestamp}-${sender}`;
}

/**
 * Fire-and-forget write:
 *  - Creates/overwrites a message doc at a deterministic ID
 *  - Updates the parent session's updatedAt with server time (merge)
 */
export async function saveMessage(
  sessionId: string,
  sender: "user" | "bot",
  text: string,
  opts?: { timestamp?: number }
) {
  console.log("[saveMessage] called with:", { sessionId, sender, text, opts });

  const timestamp = opts?.timestamp ?? Date.now();
  const messageId = buildMessageId(sessionId, timestamp, sender);
  console.log("[saveMessage] generated messageId:", messageId);

  try {
    const batch = writeBatch(db);
    const messageRef = doc(db, "chats", sessionId, "messages", messageId);
    const sessionRef = doc(db, "chats", sessionId);

    console.log("[saveMessage] writing messageRef path:", messageRef.path);
    console.log("[saveMessage] writing sessionRef path:", sessionRef.path);

    batch.set(messageRef, {
      sender,
      text,
      timestamp,                   // client clock (UI display)
      serverTime: serverTimestamp(), // authoritative ordering later
      sessionId,
    });

    batch.set(
      sessionRef,
      { updatedAt: serverTimestamp() },
      { merge: true }
    );

    await batch.commit();
    console.log("[saveMessage] batch commit complete");
    return { id: messageId, timestamp };
  } catch (err) {
    console.error("[saveMessage] error:", err);
    throw err; // rethrow to surface in the UI console too
  }
}


/** Load all messages for a session ordered by client timestamp (UI) */
export async function loadSession(sessionId: string) {
  const messagesRef = collection(db, "chats", sessionId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}
