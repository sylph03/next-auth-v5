import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
      [key: string]: any;
    };
    accessToken?: string;
    refreshToken?: string;
    accessPayload?: any;
    refreshPayload?: any;
    accessTokenExpires?: number;
    error?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessPayload?: any;
    refreshPayload?: any;
    accessTokenExpires?: number;
    user?: any;
    error?: string;
  }
}
