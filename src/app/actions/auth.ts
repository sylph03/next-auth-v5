"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { signInSchema } from "@/lib/zod";
import { User } from "@/types/next-auth";

export interface LoginState {
  success?: boolean;
  message?: string | null;
  data?: User | null;
}

export async function loginAction(
  _: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // Validate input
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      const message = parsed.error.issues.map((err) => err.message).join(", ");
      return { success: false, message };
    }

    const { email, password } = parsed.data;

    // Attempt login
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const isCredentialsError = typeof result.error === "string" && 
        result.error.includes("CredentialsSignin");
      
      return { 
        success: false, 
        message: isCredentialsError 
          ? "Email hoặc mật khẩu không đúng" 
          : result.error 
      };
    }

    return { success: true, message: "Đăng nhập thành công", data: result };
  } catch (error) {
    // Handle Next.js redirect
    const digest = (error as Error & { digest?: string })?.digest;
    if (digest?.startsWith("NEXT_REDIRECT")) {
      return { success: true, message: "Đăng nhập thành công" };
    }

    // Handle auth errors
    if (error instanceof AuthError) {
      return { success: false, message: "Email hoặc mật khẩu không đúng" };
    }

    // Handle other errors
    return { 
      success: false, 
      message: (error as Error)?.message || "Đăng nhập thất bại" 
    };
  }
}

export async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}