import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deletePost } from "@/app/actions/post"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Manage Posts" }

export default async function AdminPosts() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Blog Posts
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/admin/posts/new" className="btn btn-primary">+ New Post</Link>
      </div>

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px',
          padding: '0.65rem 1.25rem',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: '0.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          color: 'var(--text-muted)',
        }}>
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span style={{ textAlign: 'right' }}>Actions</span>
        </div>

        {posts.map((post, i) => (
          <div key={post.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 110px 140px 100px',
            padding: '1rem 1.25rem', alignItems: 'center',
            borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
            gap: '0.5rem',
          }}
            className="admin-row"
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {post.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{post.slug}</div>
            </div>
            <div>
              <span className={`badge ${post.published ? 'badge-published' : 'badge-draft'}`}>
                {post.published ? '● Published' : '○ Draft'}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {post.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Link href={`/admin/posts/${post.id}`} className="admin-edit-link">
                Edit
              </Link>
              <form action={deletePost.bind(null, post.id)} style={{ display: 'inline' }}>
                <button type="submit" className="admin-delete-btn">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No posts found.{' '}
            <Link href="/admin/posts/new" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>
              Create your first post →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .admin-row:hover { background: rgba(255,255,255,0.025) !important; }
        .admin-edit-link {
          font-size: 0.8rem; color: var(--accent-light);
          text-decoration: none; font-weight: 600;
          transition: opacity 0.15s;
        }
        .admin-edit-link:hover { opacity: 0.75; }
        .admin-delete-btn {
          background: none; border: none; cursor: pointer;
          font-size: 0.8rem; color: var(--text-muted);
          font-weight: 600; padding: 0;
          transition: color 0.15s;
          font-family: inherit;
        }
        .admin-delete-btn:hover { color: var(--danger) !important; }
      `}</style>
    </div>
  )
}
