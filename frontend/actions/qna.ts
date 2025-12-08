"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Answer = {
  answerId: number;
  questionId: number;
  answerText: string;
  userId: number;
  userName?: string;
  timestamp: string;
};

export type Question = {
  questionId: number;
  noteId: number;
  questionText: string;
  userId: number;
  userName?: string;
  timestamp: string;
  answers: Answer[];
};

type Response<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export const getQuestions = async (
  pageId: number
): Promise<Question[]> => {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL}/pages/${pageId}/questions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const json: ApiResponse<Question[]> = await res.json();
    if (!json.success || !json.data) return [];
    return json.data;
  } catch {
    return [];
  }
};

export const postQuestion = async (
  pageId: number,
  text: string
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(
      `${process.env.API_URL}/pages/${pageId}/questions`,
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
      return { success: false, error: json.error || "Failed to post question" };
    }
    return { success: true, data: json.data || { message: "Posted" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const postAnswer = async (
  questionId: number,
  text: string
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(
      `${process.env.API_URL}/questions/${questionId}/answers`,
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
      return { success: false, error: json.error || "Failed to post answer" };
    }
    return { success: true, data: json.data || { message: "Posted" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

