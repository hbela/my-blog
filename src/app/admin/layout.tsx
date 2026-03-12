import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/posts', label: 'Blog Posts', icon: '✍' },
  { href: '/admin/projects', label: 'Projects', icon: '🚀' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/api/auth/signin")
  }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '2rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.25rem',
      }}>
        <div style={{
          padding: '0.5rem 0.75rem', marginBottom: '1rem',
          fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
        }}>
          Admin Panel
        </div>

        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.75rem', borderRadius: '8px',
            fontSize: '0.875rem', fontWeight: 500,
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            transition: 'var(--transition)',
          }}
            className="admin-nav-link"
          >
            <span style={{ fontSize: '1rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: '0.65rem',
            padding: '0.6rem 0.75rem', borderRadius: '8px',
            fontSize: '0.8rem', color: 'var(--text-muted)',
            textDecoration: 'none',
          }}>
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1, padding: '2.5rem 2rem',
        background: 'var(--bg-primary)',
        overflowY: 'auto',
      }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: var(--bg-tertiary) !important;
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  )
}
