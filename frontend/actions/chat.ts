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
};

type Response<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

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
      }
    );
    const json: ApiResponse<ChatMessage[]> = await res.json();
    if (!json.success || !json.data) return [];
    return json.data;
  } catch {
    return [];
  }
};

export const sendMessage = async (
  notebookId: number,
  text: string
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
        body: JSON.stringify({ text }),
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

