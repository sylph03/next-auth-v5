"use client";

import { useSession } from "next-auth/react";

export function useToken() {
  const { data: session } = useSession();
  
  return {
    accessToken: session?.accessToken || null,
    // refreshToken: session?.refreshToken || null,
    isAuthenticated: !!session?.accessToken,
  };
}
