import { auth } from "@/auth";

/**
 * Lấy accessToken ở Server Side
 */
export async function getToken() {
  const session = await auth();
  return session?.accessToken || null;
}