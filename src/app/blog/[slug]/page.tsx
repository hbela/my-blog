import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Comments from "@/components/Comments"
import Image from "next/image"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug, published: true }
  })

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{post.title}</h1>
      <time className="text-gray-500 block mb-8">
        {post.createdAt.toLocaleDateString()}
      </time>

      {post.image && (
        <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <div className="prose prose-lg max-w-none text-gray-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <hr className="my-12 border-gray-200" />
      <Comments postSlug={post.slug} />
    </article>
  )
}
