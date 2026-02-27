import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deletePost } from "@/app/actions/post"

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Posts</h1>
        <Link href="/admin/posts/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          Create New Post
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{post.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${post.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{post.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right space-x-4">
                  <Link href={`/admin/posts/${post.id}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                  <form action={deletePost.bind(null, post.id)} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No posts found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
