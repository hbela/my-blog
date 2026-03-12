import { prisma } from "@/lib/prisma"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin Dashboard" }

export default async function AdminDashboard() {
  const postsCount = await prisma.post.count()
  const projectsCount = await prisma.project.count()
  const publishedPosts = await prisma.post.count({ where: { published: true } })
  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' }, take: 5,
    select: { id: true, title: true, slug: true, published: true, createdAt: true }
  })

  const cards = [
    { label: 'Total Posts', value: postsCount, sub: `${publishedPosts} published`, href: '/admin/posts', color: '#6366f1', icon: '✍' },
    { label: 'Projects', value: projectsCount, sub: 'All projects', href: '/admin/projects', color: '#10b981', icon: '🚀' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Welcome back! Here&apos;s an overview of your content.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {cards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              transition: 'var(--transition)', cursor: 'pointer',
            }}
              className="dash-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {card.label}
                </span>
                <span style={{ fontSize: '1.25rem' }}>{card.icon}</span>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: card.color, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '4px' }}>
                {card.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{card.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <Link href="/admin/posts/new" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>+ New Post</Link>
        <Link href="/admin/projects/new" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>+ New Project</Link>
      </div>

      {/* Recent posts */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
          Recent Posts
        </h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {recentPosts.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No posts yet. <Link href="/admin/posts/new" style={{ color: 'var(--accent-light)' }}>Create your first →</Link>
            </div>
          ) : recentPosts.map((post, i) => (
            <div key={post.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.9rem 1.25rem', gap: '1rem',
              borderBottom: i < recentPosts.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {post.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                <span className={`badge ${post.published ? 'badge-published' : 'badge-draft'}`}>
                  {post.published ? '● Published' : '○ Draft'}
                </span>
                <Link href={`/admin/posts/${post.id}`} style={{ fontSize: '0.8rem', color: 'var(--accent-light)', textDecoration: 'none' }}>
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`.dash-card:hover { border-color: var(--border-hover) !important; transform: translateY(-2px); box-shadow: var(--shadow-md); }`}</style>
    </div>
  )
}
