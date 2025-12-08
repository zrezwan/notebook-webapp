"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Notebook = {
  notebookId: number;
  title: string;
  courseName: string;
  ownerId: number;
  ownerName?: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  userRole?: string;
};

export type Collaborator = {
  userId: number;
  name: string;
  email: string;
  role: string;
};

type Response<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export const getDashboardNotebooks = async (): Promise<Notebook[]> => {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(`${process.env.API_URL}/notebooks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json: ApiResponse<Notebook[]> = await res.json();
    if (!json.success || !json.data) return [];
    return json.data;
  } catch {
    return [];
  }
};

export const searchNotebooks = async (query: string): Promise<Notebook[]> => {
  const token = await getAuthToken();
  if (!token) return [];
  if (!query || query.trim().length === 0) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/search?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const json: ApiResponse<Notebook[]> = await res.json();
    if (!json.success || !json.data) return [];
    return json.data;
  } catch {
    return [];
  }
};

export const createNotebook = async (
  title: string,
  courseName: string,
  visibility: "Private" | "Public" = "Private"
): Promise<Response<Notebook>> => {
  const baseUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return { success: false, error: "API_URL not configured" };
  }
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const url = `${baseUrl}/notebooks`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, courseName, visibility }),
    });
    const text = await res.text();
    let json: ApiResponse<Notebook> | null = null;
    try {
      json = text ? (JSON.parse(text) as ApiResponse<Notebook>) : null;
    } catch {
      // fall through
    }
    if (!res.ok) {
      const msg =
        (json && json.error) ||
        (text ? `Request failed with status ${res.status}: ${text}` : `Request failed with status ${res.status}`);
      return { success: false, error: msg };
    }
    if (!json || !json.success || !json.data) {
      return { success: false, error: (json && json.error) || "Failed to create notebook" };
    }
    return { success: true, data: json.data };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message || "Failed to connect to server" };
  }
};

export const getNotebook = async (
  notebookId: number
): Promise<Response<Notebook>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(`${process.env.API_URL}/notebooks/${notebookId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json: ApiResponse<Notebook> = await res.json();
    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Notebook not found" };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const deleteNotebook = async (
  notebookId: number
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(`${process.env.API_URL}/notebooks/${notebookId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const json: ApiResponse<{ message: string }> = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Failed to delete notebook" };
    }
    return { success: true, data: json.data || { message: "Deleted" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const getCollaborators = async (
  notebookId: number
): Promise<Collaborator[]> => {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/${notebookId}/collaborators`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const json: ApiResponse<Collaborator[]> = await res.json();
    if (!json.success || !json.data) return [];
    return json.data;
  } catch {
    return [];
  }
};

export const addCollaborator = async (
  notebookId: number,
  email: string,
  role: "Viewer" | "Editor" | "Owner" = "Viewer"
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/${notebookId}/collaborators`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      }
    );
    const json: ApiResponse<{ message: string }> = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Failed to add collaborator" };
    }
    return { success: true, data: json.data || { message: "Added" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const removeCollaborator = async (
  notebookId: number,
  userId: number
): Promise<Response<{ message: string }>> => {
  const token = await getAuthToken();
  if (!token) return { success: false, error: "Not authenticated" };

  try {
    const res = await fetch(
      `${process.env.API_URL}/notebooks/${notebookId}/collaborators/${userId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const json: ApiResponse<{ message: string }> = await res.json();
    if (!json.success) {
      return { success: false, error: json.error || "Failed to remove collaborator" };
    }
    return { success: true, data: json.data || { message: "Removed" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

