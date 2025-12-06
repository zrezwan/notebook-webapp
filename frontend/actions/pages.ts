"use server";

import { cookies } from "next/headers";

const COOKIE_NAME = "auth_token";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type Page = {
  noteId: number;
  notebookId: number;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Response<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };

async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export const getPagesByNotebook = async (
  notebookId: number
): Promise<Response<Page[]>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(
      `${process.env.API_URL}/notebooks/${notebookId}/pages`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const json: ApiResponse<Page[]> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Failed to fetch pages" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const getPage = async (pageId: number): Promise<Response<Page>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(`${process.env.API_URL}/pages/${pageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json: ApiResponse<Page> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Page not found" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const updatePage = async (
  pageId: number,
  content: string
): Promise<Response<Page>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(`${process.env.API_URL}/pages/${pageId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const json: ApiResponse<Page> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Failed to update page" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const deletePage = async (
  pageId: number
): Promise<Response<{ message: string }>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(`${process.env.API_URL}/pages/${pageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json: ApiResponse<{ message: string }> = await res.json();

    if (!json.success) {
      return { success: false, error: json.error || "Failed to delete page" };
    }

    return { success: true, data: json.data || { message: "Page deleted" } };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};

export const createPage = async (
  notebookId: number,
  content: string
): Promise<Response<Page>> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    const res = await fetch(
      `${process.env.API_URL}/notebooks/${notebookId}/pages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    const json: ApiResponse<Page> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Failed to create page" };
    }

    return { success: true, data: json.data };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
};
