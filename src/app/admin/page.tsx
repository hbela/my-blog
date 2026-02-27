import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const postsCount = await prisma.post.count()
  const projectsCount = await prisma.project.count()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-2">Blog Posts</h2>
          <p className="text-4xl font-bold text-blue-600 mb-4">{postsCount}</p>
          <Link href="/admin/posts" className="text-blue-600 hover:underline">
            Manage Posts →
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-xl font-semibold mb-2">Projects</h2>
          <p className="text-4xl font-bold text-green-600 mb-4">{projectsCount}</p>
          <Link href="/admin/projects" className="text-blue-600 hover:underline">
            Manage Projects →
          </Link>
        </div>
      </div>
    </div>
  )
}
