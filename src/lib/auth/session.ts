import "server-only";

import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";

export type User = {
  username: string;
};

/** Returns the signed-in user from the session cookie, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  // Mock tokens are "mock-<username>" (see authenticate() in actions.ts).
  // TODO: replace with a backend lookup / token decode once API_URL is wired up.
  if (token.startsWith("mock-")) {
    return { username: token.slice("mock-".length) };
  }
  return { username: "user" };
}
