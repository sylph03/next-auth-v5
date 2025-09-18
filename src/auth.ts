import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { ZodError } from "zod";
import { signInSchema } from './lib/zod';
import { User, TokenData, ApiResponse } from './types/next-auth';
import { env } from './lib/env';

async function refreshAccessToken(token: TokenData) {
  try {
    const res = await fetch(`${env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 400) {
        return {
          ...token,
          accessToken: undefined,
          refreshToken: undefined,
          accessPayload: undefined,
          refreshPayload: undefined,
          accessTokenExpires: 0,
          error: "RefreshTokenInvalid",
        };
      }
      throw new Error(`Token refresh failed: ${res.status}`);
    }

    const response: ApiResponse = await res.json();

    if (!response?.token?.accessToken) {
      throw new Error("Invalid refresh response: missing accessToken");
    }

    // Calculate token expiration
    let accessTokenExpires = 0;
    try {
      const decoded = jwtDecode<Required<JwtPayload>>(response.token.accessToken);
      const lifeTime = decoded.exp - decoded.iat;
      accessTokenExpires = Date.now() + lifeTime * 1000;
    } catch {
      // If decode fails, set to 0 to force refresh on next request
      accessTokenExpires = 0;
    }

    return {
      ...token,
      accessToken: response.token.accessToken,
      refreshToken: response.token.refreshToken ?? token.refreshToken,
      accessPayload: response.token.accessPayload,
      refreshPayload: response.token.refreshPayload,
      accessTokenExpires,
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/dashboard",
    error: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials)

          const res = await fetch(`${env.API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          if (!res.ok) throw new Error("Invalid credentials");

          const response: ApiResponse<User> = await res.json();
          if (!response.success) throw new Error(response.message);

          const user = response.data;
          const token = response.token;

          if (!user || !token) {
            throw new Error("Invalid response: missing user or token data");
          }

          return {
            ...user,
            accessToken: token.accessToken,
            refreshToken: token.refreshToken,
            accessPayload: token.accessPayload,
            refreshPayload: token.refreshPayload,
          };
        } catch (error) {
          if (error instanceof ZodError) {
            throw new Error(error.issues.map(e => e.message).join(", "))
          }
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial login
      if (user) {
        const u = user as User;
        let accessTokenExpires = 0;
        
        try {
          if (u.accessToken) {
            const decoded = jwtDecode<Required<JwtPayload>>(u.accessToken);
            const lifeTime = decoded.exp - decoded.iat;
            accessTokenExpires = Date.now() + lifeTime * 1000;
          }
        } catch {
          // If decode fails, set to 0 to force refresh on next request
          accessTokenExpires = 0;
        }

        return {
          ...token,
          id: u.id,
          email: u.email,
          roles: u.roles,
          capabilities: u.capabilities,
          accessToken: u.accessToken,
          refreshToken: u.refreshToken,
          accessPayload: u.accessPayload,
          refreshPayload: u.refreshPayload,
          accessTokenExpires,
        };
      }

      // Return if refresh token is invalid
      if (token.error === "RefreshTokenInvalid") {
        return token;
      }

      // Return if access token is still valid
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Refresh expired access token
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: (token.id as string) || '',
          email: (token.email as string) || '',
          name: session.user?.name,
          image: session.user?.image,
          roles: token.roles as string[] | undefined,
          capabilities: token.capabilities as string[] | undefined,
        },
        accessToken: token.accessToken as string | undefined,
        accessTokenExpires: token.accessTokenExpires as number | undefined,
        error: token.error as string | undefined,
      };
    },
  },
});
