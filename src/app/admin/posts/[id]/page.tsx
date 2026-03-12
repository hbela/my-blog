import { prisma } from "@/lib/prisma"
import PostForm from "@/components/admin/PostForm"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const post = await prisma.post.findUnique({ where: { id: resolvedParams.id } })
  if (!post) notFound()

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/posts" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Posts
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Edit: <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{post.title}</span>
        </h1>
      </div>
      <PostForm post={post} />
    </div>
  )
}
