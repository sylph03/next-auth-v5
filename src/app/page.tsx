import { SignIn } from "@/components/sign-in"

export default async function Home() {
  // Nếu chưa đăng nhập, hiển thị form login
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn />
    </div>
  )
}
