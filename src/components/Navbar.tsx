'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [pathname])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/blog', label: 'Blog' },
    { href: '/projects', label: 'Projects' },
    { href: '/contact', label: 'Contact' },
  ]

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all 0.25s ease',
        background: scrolled ? 'rgba(13,17,23,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(99,110,131,0.2)' : '1px solid transparent',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Image src="/icon1.png" alt="Portfolio icon" width={32} height={32} style={{ borderRadius: '8px' }} />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              ElysCom
            </span>
          </Link>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="hidden-mobile">
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: isActive(l.href) ? 'var(--accent-light)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.15s ease',
                position: 'relative',
              }}
                onMouseEnter={e => { if (!isActive(l.href)) (e.target as HTMLElement).style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { if (!isActive(l.href)) (e.target as HTMLElement).style.color = 'var(--text-secondary)' }}
              >
                {l.label}
                {isActive(l.href) && (
                  <span style={{
                    position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '2px',
                    background: 'var(--accent)', borderRadius: '2px',
                  }} />
                )}
              </Link>
            ))}

            {session?.user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                {(session.user as any).role === 'ADMIN' && (
                  <Link href="/admin" style={{
                    fontSize: '0.8rem', fontWeight: 600, padding: '4px 12px',
                    background: 'rgba(99,102,241,0.15)', color: 'var(--accent-light)',
                    borderRadius: '99px', border: '1px solid rgba(99,102,241,0.3)',
                    textDecoration: 'none', transition: 'var(--transition)',
                  }}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    fontSize: '0.8rem', fontWeight: 500,
                    color: 'var(--text-secondary)', background: 'none', border: 'none',
                    cursor: 'pointer', transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={e => (e.target as HTMLElement).style.color = 'var(--danger)'}
                  onMouseLeave={e => (e.target as HTMLElement).style.color = 'var(--text-secondary)'}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/api/auth/signin" style={{
                fontSize: '0.875rem', fontWeight: 600,
                padding: '6px 16px', borderRadius: '8px',
                background: 'var(--accent)', color: '#fff',
                textDecoration: 'none',
                boxShadow: '0 0 14px var(--accent-glow)',
                transition: 'var(--transition)',
              }}>
                Sign in
              </Link>
            )}
          </nav>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="show-mobile"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--text-primary)' }}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {mobileOpen ? (
                <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              ) : (
                <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{
            padding: '1rem 0 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            {links.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '0.6rem 0.75rem', borderRadius: '8px',
                fontSize: '0.95rem', fontWeight: 500,
                color: isActive(l.href) ? 'var(--accent-light)' : 'var(--text-secondary)',
                textDecoration: 'none',
                background: isActive(l.href) ? 'rgba(99,102,241,0.1)' : 'transparent',
              }}>
                {l.label}
              </Link>
            ))}
            {session?.user ? (
              <>
                {(session.user as any).role === 'ADMIN' && (
                  <Link href="/admin" style={{ padding: '0.6rem 0.75rem', fontSize: '0.95rem', fontWeight: 500, color: 'var(--accent-light)', textDecoration: 'none' }}>
                    Admin
                  </Link>
                )}
                <button onClick={() => signOut({ callbackUrl: '/' })} style={{ textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.95rem', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/api/auth/signin" style={{ padding: '0.6rem 0.75rem', fontSize: '0.95rem', fontWeight: 600, color: 'var(--accent-light)', textDecoration: 'none' }}>
                Sign in
              </Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media(max-width:680px){.hidden-mobile{display:none!important;}.show-mobile{display:flex!important;}}
        @media(min-width:681px){.show-mobile{display:none!important;}}
      `}</style>
    </header>
  )
}
