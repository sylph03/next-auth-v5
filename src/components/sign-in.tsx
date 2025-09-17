"use client"
import { useEffect } from "react"
import { useFormState } from "react-dom"
import { loginAction, type LoginState } from "@/app/actions/auth"
 
export function SignIn() {
  const initialState: LoginState = { success: undefined, message: null }
  const [state, formAction] = useFormState(loginAction, initialState)

  useEffect(() => {
    if (state?.success) {
      // Force refresh để cập nhật session
      window.location.href = "/dashboard"
    }
  }, [state?.success])
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <form
        action={formAction}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800 text-center">
          Sign In
        </h2>

        {state?.success === false && state?.message && (
          <p className="text-red-600 text-sm text-center" aria-live="polite">
            {state.message}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-700 font-medium" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          Sign In
        </button>

        <p className="text-sm text-gray-500 text-center">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-indigo-600 hover:underline">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  )
}