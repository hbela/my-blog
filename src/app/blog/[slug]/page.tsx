import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Comments from "@/components/Comments"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({ where: { slug } })
  return {
    title: post?.title ?? 'Post not found',
    description: post?.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug, published: true }
  })

  if (!post) notFound()

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      {/* Back link — CSS hover, no event handlers */}
      <Link href="/blog" className="back-link">
        ← Back to Blog
      </Link>

      {/* Post header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <time style={{
          fontSize: '0.8rem', color: 'var(--text-muted)',
          fontWeight: 500, display: 'block', marginBottom: '0.75rem',
        }}>
          {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </time>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
          fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15,
          color: 'var(--text-primary)', marginBottom: '1rem',
        }}>
          {post.title}
        </h1>
        {post.excerpt && (
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: '600px' }}>
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Cover image */}
      {post.image && (
        <div style={{
          position: 'relative', width: '100%', height: '420px',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
          marginBottom: '3rem',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <Image src={post.image} alt={post.title} fill className="object-cover" />
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '2.5rem' }} />

      {/* Content */}
      <div className="prose-dark">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '3.5rem 0' }} />

      {/* Comments */}
      <Comments postSlug={post.slug} />

      <style>{`
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 2.5rem;
          transition: color 0.15s;
        }
        .back-link:hover { color: var(--accent-light); }
      `}</style>
    </div>
  )
}
