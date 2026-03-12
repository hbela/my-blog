import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      padding: '2.5rem 1.5rem',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '4px' }}>Portfolio</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Building things for the web.</p>
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem' }}>
          {[['/', 'Home'], ['/blog', 'Blog'], ['/projects', 'Projects'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} className="footer-link">
              {label}
            </Link>
          ))}
        </nav>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© {year} Portfolio. All rights reserved.</p>
      </div>

      <style>{`
        .footer-link {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: var(--text-primary); }
      `}</style>
    </footer>
  )
}
