import { notFound } from "next/navigation"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { parseDocThemeMarkdown } from "@/lib/doc-theme"

export const dynamic = "force-static"
export const dynamicParams = false

type LegalDocConfig = {
  file: string
  badge: string
  brandIcon: string
  brandName: string
  brandSubtitle: string
  navGroupTitle: string
  footer: string
  headerLabel: string
}

const LEGAL_DOCS: Record<string, Record<string, LegalDocConfig>> = {
  "finance-manager": {
    privacy: {
      file: "docs/finance-manager/PRIVACY_POLICY.md",
      badge: "🔒 Privacy",
      brandIcon: "F",
      brandName: "Finance Manager",
      brandSubtitle: "Privacy Policy",
      navGroupTitle: "Sections",
      footer: "© 2026 Standalone Finance Management",
      headerLabel: "Privacy Policy",
    },
    terms: {
      file: "docs/finance-manager/TERMS_OF_SERVICE.md",
      badge: "📄 Terms",
      brandIcon: "F",
      brandName: "Finance Manager",
      brandSubtitle: "Terms of Service",
      navGroupTitle: "Sections",
      footer: "© 2026 Standalone Finance Management",
      headerLabel: "Terms of Service",
    },
  },
}

export function generateStaticParams() {
  const params: { slug: string; doc: string }[] = []
  for (const [slug, docs] of Object.entries(LEGAL_DOCS)) {
    for (const doc of Object.keys(docs)) {
      params.push({ slug, doc })
    }
  }
  return params
}

export default async function ProjectDocPage({
  params,
}: {
  params: Promise<{ slug: string; doc: string }>
}) {
  const { slug, doc } = await params
  const config = LEGAL_DOCS[slug]?.[doc]
  if (!config) notFound()

  const markdown = await readFile(path.join(process.cwd(), config.file), "utf8")
  const { heroTitle, heroSubtitleHtml, html, sidebarItems } = parseDocThemeMarkdown(markdown, {
    stripLeadingNumbers: true,
  })

  return (
    <div className="taskmanager-doc-container">
      <link rel="stylesheet" href="/doc-theme/doc-theme.css" />

      <div className="doc-progress-bar"><div className="doc-progress-bar-inner"></div></div>
      <button className="doc-menu-toggle" aria-label="Toggle menu">☰</button>
      <div className="doc-overlay"></div>

      <aside className="doc-sidebar">
        <div className="doc-sidebar-brand">
          <h1><span className="brand-icon">{config.brandIcon}</span> {config.brandName}</h1>
          <span className="brand-subtitle">{config.brandSubtitle}</span>
        </div>
        <nav className="doc-sidebar-nav">
          <div className="doc-nav-group">
            <div className="doc-nav-group-title">{config.navGroupTitle}</div>
            {sidebarItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                <span className="doc-nav-number">{item.number}</span>
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </a>
            ))}
          </div>
          <div className="doc-nav-group">
            <div className="doc-nav-group-title">More</div>
            <a href={`/projects/${slug}`}>
              <span className="doc-nav-number">←</span>
              <span>Back to User Guide</span>
            </a>
          </div>
        </nav>
        <div className="doc-sidebar-footer">{config.footer}</div>
      </aside>

      <main className="doc-main">
        <header className="doc-header">
          <div className="doc-header-title">
            <strong>{config.brandName}</strong>&nbsp; · &nbsp;{config.headerLabel}
          </div>
        </header>
        <div className="doc-content">
          <div className="doc-hero">
            <div className="doc-hero-badge">{config.badge}</div>
            <h1>{heroTitle}</h1>
            {heroSubtitleHtml && (
              <p dangerouslySetInnerHTML={{ __html: heroSubtitleHtml }} />
            )}
          </div>

          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </main>

      <div className="doc-lightbox">
        <button className="doc-lightbox-close" aria-label="Close">✕</button>
        <img alt="" />
      </div>
      <script src="/doc-theme/doc-theme.js" async defer></script>
    </div>
  )
}
