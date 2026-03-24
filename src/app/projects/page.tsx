import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import type { Metadata } from "next"

export const revalidate = 604800 // revalidate at most once per week; busted immediately on publish

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of projects I have built — from web apps to open-source tools.",
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '3.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '99px', padding: '3px 12px',
          fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
        }}>🚀 Projects</div>
<p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '480px' }}>
          A selection of projects across web development, APIs, and open source.
        </p>
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.5rem',
      }}>
        {projects.map((project, i) => (
          <Link key={project.id} href={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
            <article style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
              height: '100%',
              display: 'flex', flexDirection: 'column',
              animationDelay: `${i * 0.05}s`,
            }}
              className="animate-fade-up project-card"
            >
              {/* Image / placeholder */}
              <div style={{ position: 'relative', height: '200px', flexShrink: 0, overflow: 'hidden' }}>
                {project.image ? (
                  <Image src={project.image} alt={project.title} fill style={{ objectFit: 'cover' }}
                    className="project-img" />
                ) : (
                  <div style={{
                    inset: 0, position: 'absolute',
                    background: `linear-gradient(135deg, hsl(${(i * 60) % 360}deg 40% 15%), hsl(${(i * 60 + 30) % 360}deg 50% 20%))`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: '2.5rem', fontWeight: 900, opacity: 0.25,
                      color: '#fff', letterSpacing: '-0.05em',
                    }}>
                      {project.title[0]}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '1.4rem 1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h2 style={{
                  fontSize: '1.1rem', fontWeight: 700,
                  color: 'var(--text-primary)', marginBottom: '0.5rem',
                  letterSpacing: '-0.02em',
                }}>
                  {project.title}
                </h2>
                {project.excerpt && (
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.875rem',
                    lineHeight: 1.65, marginBottom: '1rem', flex: 1,
                  }}>
                    {project.excerpt}
                  </p>
                )}
                {project.technologies && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
                    {project.technologies.split(',').slice(0, 4).map((t, j) => (
                      <span key={j} className="badge badge-tech" style={{ fontSize: '0.7rem' }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </Link>
        ))}

        {projects.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--border)',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🚀</div>
            <p style={{ color: 'var(--text-secondary)' }}>No projects yet. Check back soon!</p>
          </div>
        )}
      </div>

      <style>{`
        .project-card:hover {
          border-color: var(--accent) !important;
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        .project-card .project-img {
          transition: transform 0.5s ease !important;
        }
        .project-card:hover .project-img {
          transform: scale(1.06) !important;
        }
      `}</style>
    </div>
  )
}
