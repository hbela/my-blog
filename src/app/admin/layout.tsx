import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/api/auth/signin")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r min-h-full p-4 flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded">
          Dashboard
        </Link>
        <Link href="/admin/posts" className="p-2 hover:bg-gray-100 rounded">
          Manage Posts
        </Link>
        <Link href="/admin/projects" className="p-2 hover:bg-gray-100 rounded">
          Manage Projects
        </Link>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
