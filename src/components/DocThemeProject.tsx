import { parseDocThemeMarkdown } from "@/lib/doc-theme"
import MermaidRenderer from "@/components/MermaidRenderer"

type DocThemeProjectProps = {
  /** Raw markdown to render with the doc-theme layout. */
  content: string
  /** Single-letter badge shown in the sidebar brand block. */
  brandIcon: string
  /** Brand label shown in the sidebar and header (usually the project title). */
  brandLabel: string
  /** Wrap standalone images in browser-chrome screenshot cards (with lightbox). */
  imagesAsScreenshots?: boolean
  /** Render the client-side mermaid diagram support. */
  mermaid?: boolean
  /** Footer line under the sidebar. Defaults to "© <year> <brandLabel>". */
  footer?: string
}

/**
 * Renders a project's markdown with the polished "doc-theme" layout: a fixed
 * sidebar with numbered sections, a hero, screenshot cards, and the
 * progress-bar / lightbox chrome (driven by /public/doc-theme/doc-theme.{css,js}).
 *
 * Extracted from the duplicated finance-manager / sunshine-dental / taskmanager
 * blocks in projects/[slug]/page.tsx so any project flagged `docTheme` can reuse it.
 */
export default function DocThemeProject({
  content,
  brandIcon,
  brandLabel,
  imagesAsScreenshots = false,
  mermaid = false,
  footer,
}: DocThemeProjectProps) {
  const { heroTitle, heroSubtitleHtml, html, sidebarItems } = parseDocThemeMarkdown(
    content,
    { imagesAsScreenshots },
  )

  const [titleLead, ...titleTail] = heroTitle.split(/\s+[—–-]\s+/)
  const titleSuffix = titleTail.join(" — ")
  const footerText = footer ?? `© ${new Date().getFullYear()} ${brandLabel}`

  return (
    <div className="taskmanager-doc-container">
      <link rel="stylesheet" href="/doc-theme/doc-theme.css" />

      <div className="doc-progress-bar"><div className="doc-progress-bar-inner"></div></div>
      <button className="doc-menu-toggle" aria-label="Toggle menu">☰</button>
      <div className="doc-overlay"></div>

      <aside className="doc-sidebar">
        <div className="doc-sidebar-brand">
          <h1><span className="brand-icon">{brandIcon}</span> {brandLabel}</h1>
          <span className="brand-subtitle">User Guide v1.0</span>
        </div>
        <nav className="doc-sidebar-nav">
          <div className="doc-nav-group">
            <div className="doc-nav-group-title">Contents</div>
            {sidebarItems.map((item) => (
              <a key={item.id} href={`#${item.id}`}>
                <span className="doc-nav-number">{item.number}</span>
                <span dangerouslySetInnerHTML={{ __html: item.text }} />
              </a>
            ))}
          </div>
        </nav>
        <div className="doc-sidebar-footer">{footerText}</div>
      </aside>

      <main className="doc-main">
        <header className="doc-header">
          <div className="doc-header-title"><strong>{brandLabel}</strong>&nbsp; · &nbsp;Documentation</div>
        </header>
        <div className="doc-content">
          <div className="doc-hero">
            <div className="doc-hero-badge">📖 User Guide</div>
            <h1>
              {titleLead}
              {titleSuffix && (<><br />{titleSuffix}</>)}
            </h1>
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
      {mermaid && <MermaidRenderer />}
    </div>
  )
}
