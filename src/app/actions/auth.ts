"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export type LoginState = {
  success?: boolean;
  message?: string | null;
  data?: any;
};

export async function loginAction(_: LoginState, formData: FormData): Promise<LoginState> {
  try {
    // Tắt redirect để trả state cho UI và kiểm tra lỗi từ NextAuth
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });
    
    if (result?.error) {
      // Map lỗi NextAuth rõ ràng hơn
      if (typeof result.error === "string" && result.error.includes("CredentialsSignin")) {
        return { success: false, message: "Email hoặc mật khẩu không đúng" };
      }
      return { success: false, message: result.error };
    }
    
    // Thành công nếu không có lỗi từ NextAuth
    return { success: true, message: "Đăng nhập thành công" };
  } catch (error) {
    console.error("[loginAction] error", error);
    
    // NEXT_REDIRECT là lỗi điều hướng nội bộ của Next khi signIn muốn redirect
    const digest = (error as any)?.digest as string | undefined;
    if (digest && digest.startsWith("NEXT_REDIRECT")) {
      return { success: true, message: "Đăng nhập thành công" };
    }
    
    if (error instanceof AuthError) {
      return { success: false, message: "Email hoặc mật khẩu không đúng" };
    }
    
    const message = (error as any)?.message || "Đăng nhập thất bại";
    return { success: false, message };
  }
}

export async function logoutAction() {
  "use server";
  await (signOut as any)({ redirect: false });
  const { redirect } = await import("next/navigation");
  redirect("/");
}


