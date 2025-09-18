import NextAuth from "next-auth";

export interface JWTPayload {
  sub?: string;
  iat?: number;
  exp?: number;
  jti?: string;
  iss?: string;
  aud?: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  roles?: string[];
  capabilities?: string[];
  accessToken?: string;
  refreshToken?: string;
  accessPayload?: JWTPayload;
  refreshPayload?: JWTPayload;
}

export interface TokenData {
  accessToken?: string;
  refreshToken?: string;
  accessPayload?: JWTPayload;
  refreshPayload?: JWTPayload;
  accessTokenExpires?: number;
  error?: string;
  id?: string;
  email?: string | null;
  roles?: string[];
  capabilities?: string[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  token?: {
    accessToken: string;
    refreshToken: string;
    accessPayload?: JWTPayload;
    refreshPayload?: JWTPayload;
  };
}

declare module "next-auth" {
  interface Session {
    user: User;
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }

  interface JWT extends TokenData {
    user?: User;
  }
}
