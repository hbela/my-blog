import Link from "next/link"

export default function Home() {
  return (
    <div className="hero-gradient" style={{ minHeight: 'calc(100vh - 64px)', position: 'relative', overflow: 'hidden' }}>
      {/* Dot grid decoration */}
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }} />

      {/* Glow orbs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '-5%',
        width: '350px', height: '350px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Hero content */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 64px)',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        {/* Eyebrow badge */}
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: '99px', padding: '4px 14px',
          fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em',
          color: 'var(--accent-light)', marginBottom: '1.5rem',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
          Available for work
        </div>

        <h1 className="animate-fade-up" style={{
          fontSize: 'clamp(1.75rem, 4.9vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          color: 'var(--text-primary)',
          marginBottom: '1.25rem',
          animationDelay: '0.05s',
        }}>
          Hi, I&apos;m a{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Developer.
          </span>
        </h1>

        <p className="animate-fade-up" style={{
          maxWidth: '560px',
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
          animationDelay: '0.1s',
        }}>
          I build exceptional digital experiences — sharing projects, thoughts,
          and tutorials about modern web development.
        </p>

        <div className="animate-fade-up" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', animationDelay: '0.15s' }}>
          <Link href="/projects" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', borderRadius: '12px' }}>
            View Projects →
          </Link>
          <Link href="/blog" className="btn btn-secondary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', borderRadius: '12px' }}>
            Read Blog
          </Link>
        </div>

        {/* Stats row */}
        <div className="animate-fade-up" style={{
          display: 'flex', gap: '3rem', marginTop: '5rem',
          animationDelay: '0.25s', flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {[
            { label: 'Projects Built', value: '20+' },
            { label: 'Blog Posts', value: '10+' },
            { label: 'Years Coding', value: '5+' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
