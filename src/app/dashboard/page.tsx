"use client";

import { useSession } from "next-auth/react";
import { logoutAction } from "@/app/actions/auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if token is invalid
  useEffect(() => {
    if (session?.error === "RefreshTokenInvalid" || session?.error === "RefreshAccessTokenError") {
      router.push("/");
    }
  }, [session?.error, router]);

  // Show loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </main>
    );
  }

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/");
    return null;
  }

  // Show error state
  if (session?.error === "RefreshTokenInvalid" || session?.error === "RefreshAccessTokenError") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <h1 className="text-xl font-semibold text-red-600 mt-4">Phiên đăng nhập đã hết hạn</h1>
          <p className="text-gray-600 mt-2">Đang chuyển hướng...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">Dashboard</h1>

        <form action={logoutAction} className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
          >
            Logout
          </button>
        </form>

        <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto h-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Session Info</h2>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {JSON.stringify(session, null, 2)}
          </pre>
        </section>

      </div>
    </main>
  )
}


