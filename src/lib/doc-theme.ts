import { marked, Marked } from "marked"

export type SidebarItem = { id: string; text: string; number: string }

export type ParseOptions = {
  stripLeadingNumbers?: boolean
}

export type ParsedDoc = {
  heroTitle: string
  heroSubtitleHtml: string
  html: string
  sidebarItems: SidebarItem[]
}

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function detectCallout(innerHtml: string): { variant: string; icon: string } {
  const lead = innerHtml.match(/<strong>(.+?)<\/strong>/i)?.[1]?.toLowerCase() ?? ""
  if (
    lead.startsWith("heads-up") ||
    lead.startsWith("warning") ||
    lead.startsWith("caution") ||
    lead.startsWith("encrypted export status")
  ) {
    return { variant: "warning", icon: "⚠️" }
  }
  if (lead.startsWith("you don") || lead.startsWith("good news")) {
    return { variant: "success", icon: "✅" }
  }
  if (lead.startsWith("note")) return { variant: "info", icon: "📝" }
  return { variant: "info", icon: "💡" }
}

export function parseDocThemeMarkdown(
  markdown: string,
  options: ParseOptions = {},
): ParsedDoc {
  const md = new Marked()
  const tokens = md.lexer(markdown) as any[]

  let heroTitle = ""
  let heroSubtitleHtml = ""

  const sidebarItems: SidebarItem[] = []
  const renderer = new marked.Renderer() as any
  let sectionNumber = 0

  // Pull leading H1 (title for the hero) and the first paragraph after it (subtitle).
  // Inline markdown (bold, links) inside the subtitle is parsed to HTML.
  const h1Idx = tokens.findIndex((t) => t.type === "heading" && t.depth === 1)
  if (h1Idx !== -1) {
    heroTitle = tokens[h1Idx].text as string
    tokens.splice(h1Idx, 1)
    while (tokens.length && tokens[0].type === "space") tokens.shift()
    if (tokens.length && tokens[0].type === "paragraph") {
      const subtitleToken = tokens.shift()
      const parser = new marked.Parser({ renderer }) as any
      heroSubtitleHtml = (parser.parseInline(subtitleToken.tokens) as string).replace(
        /\n/g,
        "<br />",
      )
    }
  }

  renderer.heading = function (token: any) {
    if (token.depth === 1) return ""
    if (token.depth === 2) {
      sectionNumber++
      let innerHtml = this.parser.parseInline(token.tokens) as string
      let slugSource = token.text as string
      if (options.stripLeadingNumbers) {
        innerHtml = innerHtml.replace(/^\s*\d+\.\s+/, "")
        slugSource = slugSource.replace(/^\s*\d+\.\s+/, "")
      }
      const sectionId = slugifyHeading(slugSource)
      const numStr = String(sectionNumber).padStart(2, "0")
      sidebarItems.push({ id: sectionId, text: innerHtml, number: numStr })
      return (
        (sectionNumber > 1 ? `</section>\n` : ``) +
        `<section class="doc-section" id="${sectionId}">\n` +
        `<div class="doc-section-header">\n` +
        `<span class="doc-section-number">${numStr}</span>\n` +
        `<h2>${innerHtml}</h2>\n` +
        `</div>\n`
      )
    }
    return `<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`
  }

  renderer.blockquote = function (token: any) {
    const inner = this.parser.parse(token.tokens)
    const { variant, icon } = detectCallout(inner)
    return `<div class="doc-callout doc-callout--${variant}"><span class="callout-icon">${icon}</span><div>${inner}</div></div>\n`
  }

  renderer.table = function (token: any) {
    const headerHtml = token.header
      .map((cell: any) => `<th>${this.parser.parseInline(cell.tokens)}</th>`)
      .join("")
    const bodyHtml = token.rows
      .map(
        (row: any[]) =>
          `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`,
      )
      .join("")
    return `<div class="doc-table-wrapper"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>\n`
  }

  renderer.code = function (token: any) {
    const lang = (token.lang || "").trim()
    const escaped = token.text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    return `<div class="doc-code-block">${lang ? `<div class="code-header">${lang}</div>` : ""}<pre><code>${escaped}</code></pre></div>\n`
  }

  // The user-guide markdown uses `---` separators between sections; the H2
  // renderer already closes the previous section, so swallow standalone hrs.
  renderer.hr = function () {
    return ""
  }

  md.use({ renderer })
  let html = md.parser(tokens as any)
  if (sectionNumber > 0) html += `</section>\n`

  return { heroTitle, heroSubtitleHtml, html, sidebarItems }
}
