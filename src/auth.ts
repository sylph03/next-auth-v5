import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode, JwtPayload } from "jwt-decode";

async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: token.refreshToken,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(`❌ Refresh failed ${res.status}:`, text);

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
      throw new Error(`Failed to refresh token: ${res.status} ${text}`);
    }

    const response = await res.json();

    if (!response?.token?.accessToken) {
      throw new Error("Invalid refresh response: missing accessToken");
    }

    // 🔑 decode accessToken mới → tính lifetime
    let accessTokenExpires = 0;
    try {
      const decoded = jwtDecode<Required<JwtPayload>>(response.token.accessToken);
      const lifeTime = decoded.exp - decoded.iat;
      accessTokenExpires = Date.now() + lifeTime * 1000;
    } catch (e) {
      console.warn("⚠️ Cannot decode refreshed accessToken:", e);
    }

    const newToken = {
      ...token,
      accessToken: response.token.accessToken,
      refreshToken: response.token.refreshToken ?? token.refreshToken,
      accessPayload: response.token.accessPayload,
      refreshPayload: response.token.refreshPayload,
      accessTokenExpires,
      error: undefined,
    };

    console.log(
      "✅ New access token issued, expires at:",
      new Date(accessTokenExpires).toISOString()
    );

    return newToken;
  } catch (error) {
    console.error("Refresh token error:", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) return null;

        const res = await fetch(`${process.env.API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!res.ok) throw new Error("Invalid credentials");

        const response = await res.json();
        if (!response.success) throw new Error(response.message);

        const user = response.data;
        const token = response.token;

        return {
          ...(user || {}),
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          accessPayload: token.accessPayload,
          refreshPayload: token.refreshPayload,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // ✅ Khi login lần đầu
      if (user) {
        console.log("🔑 Login success, setting initial token");
        const u: any = user;

        let accessTokenExpires = 0;
        try {
          const decoded = jwtDecode<Required<JwtPayload>>(u.accessToken);
          const lifeTime = decoded.exp - decoded.iat;
          accessTokenExpires = Date.now() + lifeTime * 1000;
        } catch (e) {
          console.warn("⚠️ Cannot decode accessToken:", e);
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

      // ❌ Nếu refresh token đã invalid → return luôn
      if (token.error === "RefreshTokenInvalid") {
        return token;
      }

      // ⏳ Nếu access token còn hạn → dùng tiếp
      if (token.accessTokenExpires && Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // ♻️ Nếu hết hạn → refresh
      console.log("♻️ Access token expired, refreshing...");
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      const s: any = session;
      s.user = {
        id: token.id,
        email: token.email,
        roles: token.roles,
        capabilities: token.capabilities,
      };
      s.accessToken = token.accessToken;
      s.refreshToken = token.refreshToken;
      s.accessPayload = token.accessPayload;
      s.refreshPayload = token.refreshPayload;
      s.error = token.error;
      s.accessTokenExpires = token.accessTokenExpires;
      return s;
    },
  },
});
