import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts, tutorials, and articles on web development and technology.",
}

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '99px', padding: '3px 12px',
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
        }}>✍ Blog</div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800, letterSpacing: '-0.03em',
          color: 'var(--text-primary)', marginBottom: '0.75rem',
        }}>
          Articles & Thoughts
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '500px' }}>
          Exploring ideas in web development, design systems, and software engineering.
        </p>
      </div>

      {/* Posts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {posts.map((post, i) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: 'none' }}
          >
            <article style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 2rem',
              transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              animationDelay: `${i * 0.05}s`,
            }}
              className="animate-fade-up post-card"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    fontSize: '1.25rem', fontWeight: 700,
                    color: 'var(--text-primary)', marginBottom: '0.5rem',
                    letterSpacing: '-0.02em', lineHeight: 1.3,
                  }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{
                      color: 'var(--text-secondary)', fontSize: '0.925rem',
                      lineHeight: 1.65, marginBottom: '1rem',
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <time style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {post.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  </div>
                </div>
                <div style={{
                  color: 'var(--accent-light)', fontSize: '1.2rem',
                  flexShrink: 0, marginTop: '2px',
                  transition: 'transform 0.2s',
                }} className="post-arrow">
                  →
                </div>
              </div>
            </article>
          </Link>
        ))}

        {posts.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>No posts yet. Check back soon!</p>
          </div>
        )}
      </div>

      <style>{`
        .post-card:hover {
          border-color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .post-card:hover .post-arrow {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  )
}
