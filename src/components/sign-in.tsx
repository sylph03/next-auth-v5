"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { loginAction, type LoginState } from "@/app/actions/auth";

export function SignIn() {
  const initialState: LoginState = { success: undefined, message: null };
  const [state, formAction] = useFormState(loginAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state?.success, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <form
        action={formAction}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Đăng nhập
          </h2>
          <p className="text-gray-600 mt-1">
            Vui lòng đăng nhập để tiếp tục
          </p>
        </div>

        {state?.success === false && state?.message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm text-center" aria-live="polite">
              {state.message}
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Nhập email của bạn"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-700 font-medium" htmlFor="password">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Nhập mật khẩu của bạn"
              required
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Đăng nhập
        </button>

        <p className="text-sm text-gray-500 text-center">
          Chưa có tài khoản?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline font-medium">
            Đăng ký ngay
          </a>
        </p>
      </form>
    </div>
  )
}
