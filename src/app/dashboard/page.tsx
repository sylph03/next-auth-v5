"use client"
import { useSession } from "next-auth/react"
import { logoutAction } from "@/app/actions/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect về / nếu có lỗi refresh token
  useEffect(() => {
    if (session?.error === "RefreshTokenInvalid" || session?.error === "RefreshAccessTokenError") {
      console.log("🔄 Token expired, redirecting to home page")
      router.push("/")
    }
  }, [session?.error, router])

  // Hiển thị thông báo redirect nếu có lỗi token
  if (session?.error === "RefreshTokenInvalid" || session?.error === "RefreshAccessTokenError") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
            <h1 className="text-xl font-semibold text-red-600 mt-4">Phiên đăng nhập đã hết hạn</h1>
            <p className="text-gray-600 mt-2">Đang chuyển hướng về trang chủ...</p>
          </div>
        </div>
      </main>
    )
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-gray-800 text-center">Chưa đăng nhập</h1>
          <p className="text-gray-600 text-center">Vui lòng đăng nhập để truy cập dashboard.</p>
        </div>
      </main>
    )
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

        <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-[400px]">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Session Info</h2>
          <pre className="text-sm text-gray-800 whitespace-pre-wrap break-words">
            {JSON.stringify(session, null, 2)}
          </pre>
        </section>

        {/* Hiển thị thông tin token refresh */}
        <section className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Token Status</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Access Token:</strong> {session?.accessToken ? "✅ Có" : "❌ Không có"}</p>
            <p><strong>Refresh Token:</strong> {session?.refreshToken ? "✅ Có" : "❌ Không có"}</p>
            <p><strong>Token Expires:</strong> {session?.accessTokenExpires ? new Date(session.accessTokenExpires).toLocaleString() : "Không xác định"}</p>
            <p><strong>Error:</strong> {session?.error || "Không có lỗi"}</p>
          </div>
        </section>
      </div>
    </main>
  )
}


