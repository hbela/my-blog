import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-10">Blog</h1>
      <div className="space-y-8">
        {posts.map(post => (
          <article key={post.id} className="border-b pb-8">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="hover:text-blue-600">
                {post.title}
              </Link>
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {post.createdAt.toLocaleDateString()}
            </p>
            <p className="text-gray-700">{post.excerpt}</p>
            <div className="mt-4">
              <Link href={`/blog/${post.slug}`} className="text-blue-600 font-medium hover:underline">
                Read more →
              </Link>
            </div>
          </article>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500">No blog posts available.</p>
        )}
      </div>
    </div>
  )
}
