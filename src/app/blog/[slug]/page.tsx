import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Comments from "@/components/Comments"
import ReadingProgress from "@/components/ReadingProgress"
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

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const post = await prisma.post.findUnique({
    where: { slug: resolvedParams.slug, published: true }
  })

  if (!post) notFound()

  const readTime = readingTime(post.content)

  return (
    <>
      <ReadingProgress />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 1.5rem 6rem' }}>

        {/* Back link */}
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>

        {/* Hero header */}
        <header className="post-hero">
          <div className="post-meta">
            <time>
              {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="post-meta-dot">·</span>
            <span>{readTime}</span>
          </div>

          <h1 className="post-title">{post.title}</h1>

          {post.excerpt && (
            <p className="post-excerpt">{post.excerpt}</p>
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

        {/* Content */}
        <div className="prose-dark">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '3.5rem 0' }} />

        {/* Comments */}
        <Comments postSlug={post.slug} />
      </div>

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

        .post-hero {
          position: relative;
          background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: var(--radius-xl);
          padding: 2.5rem 2.75rem;
          margin-bottom: 2.5rem;
          overflow: hidden;
        }
        .post-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), var(--accent-light));
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .post-meta-dot { color: var(--border-hover); }

        .post-title {
          font-size: clamp(1.8rem, 5vw, 2.75rem);
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1.15;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .post-excerpt {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 600px;
          margin: 0;
        }
      `}</style>
    </>
  )
}
