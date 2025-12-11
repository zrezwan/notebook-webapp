"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type ChatMessage = {
  messageId: number;
  notebookId: number;
  userId: number;
  userName?: string;
  messageText: string;
  timestamp: string;
  type?: "sticky" | "chat"; // Add type to distinguish message types
};

type Response<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export const deleteMessage = async (
  messageId: number
): Promise<Response<{ message: string }>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(`${process.env.API_URL}/notebooks/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success) {
      return { success: false, error: json.error || "Failed to delete message" };
    }

    return { success: true, data: json.data || { message: "Message deleted" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const getMessages = async (
  notebookId: number
): Promise<ChatMessage[]> => {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/messages/${notebookId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store", // Ensure fresh data
      }
    );
    const json: ApiResponse<ChatMessage[]> = await res.json();
    if (!json.success || !json.data) return [];
    
    // Parse message type from text (workaround for no DB access)
    // Format: [TYPE:sticky]actual message or [TYPE:chat]actual message
    return json.data.map(msg => {
      const typeMatch = msg.messageText.match(/^\[TYPE:(sticky|chat)\]/);
      if (typeMatch) {
        return {
          ...msg,
          type: typeMatch[1] as "sticky" | "chat",
          messageText: msg.messageText.replace(/^\[TYPE:(sticky|chat)\]/, "")
        };
      }
      // Default to sticky for backward compatibility
      return { ...msg, type: "sticky" as const };
    });
  } catch {
    return [];
  }
};

export const sendMessage = async (
  notebookId: number,
  text: string,
  type: "sticky" | "chat" = "sticky" // Add type parameter with default
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/messages/${notebookId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text, type }), // Include type in request
      }
    );
    const json: ApiResponse<{ message: string }> = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Failed to send message" };
    }
    return { success: true, data: json.data || { message: "Sent" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};