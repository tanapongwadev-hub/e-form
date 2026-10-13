"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { MOCK_USERS } from "@/lib/auth/mock-users";

export type LoginResult = { error: string } | undefined;

export async function login(input: LoginInput): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "ข้อมูลไม่ถูกต้อง" };
  }

  const token = await authenticate(parsed.data.username, parsed.data.password);
  if (!token) {
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Browser-session cookie unless "remember me" is checked.
    maxAge: parsed.data.remember ? 60 * 60 * 24 * 30 : undefined,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}

/**
 * Calls the backend login endpoint and returns a session token, or null on failure.
 * Set API_URL in .env.local. Without it, dev checks against MOCK_USERS.
 */
async function authenticate(username: string, password: string): Promise<string | null> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("API_URL is not configured");
    }
    const user = MOCK_USERS.find((u) => u.username === username && u.password === password);
    return user ? `mock-${user.username}` : null;
  }

  // TODO: adjust path and response shape to match the backend.
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const data: { token?: string } = await res.json();
  return data.token ?? null;
}
