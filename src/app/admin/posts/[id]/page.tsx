import { prisma } from "@/lib/prisma"
import PostForm from "@/components/admin/PostForm"
import { notFound } from "next/navigation"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Post: {post.title}</h1>
      <PostForm post={post} />
    </div>
  )
}
