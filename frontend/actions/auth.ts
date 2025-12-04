"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

type AuthUser = {
  userId: number;
  name: string;
  email: string;
};

type AuthResponse = AuthUser & {
  token: string;
};

type Response<T> = {
    success: true
    data: T
} | {
    success: false
    error: string
}

export const login = async (
  email: string,
  password: string
): Promise<Response<AuthUser>> => {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json: ApiResponse<AuthResponse> = await res.json();

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Login failed" };
    }

    const { token, ...user } = json.data;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return { success: true, data: user };
  } catch {
    return { success: false, error: "Failed to connect to server" };
  }
}

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<Response<AuthUser>> => {
  try {
      console.log("MAKING")
      console.log(JSON.stringify({ name, email, password }))
    const res = await fetch(`${process.env.API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const json: ApiResponse<AuthResponse> = await res.json()

    if (!json.success || !json.data) {
      return { success: false, error: json.error || "Registration failed" };
    }

    const { token, ...user } = json.data;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return { success: true, data: user };
  } catch (e: unknown) {
    return { success: false, error: (e as Error).message };
  }
}

export const logout = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export const getUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const res = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json: ApiResponse<AuthUser> = await res.json();

    if (!json.success || !json.data) {
      return null;
    }

    return json.data;
  } catch {
    return null;
  }
}
