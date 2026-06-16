"use client"

import { useEffect } from "react"

// Loads Mermaid from the CDN on the client and renders any `.mermaid` blocks
// produced by the doc-theme markdown parser. Kept out of the server component
// so we don't emit an inline <script> (which React won't run on navigation).
export default function MermaidRenderer() {
  useEffect(() => {
    let cancelled = false
    // Non-literal specifier: TypeScript types this as `any` (no module
    // resolution) and bundlers leave it as a runtime import of the CDN URL.
    const mermaidUrl =
      "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs"
    import(/* webpackIgnore: true */ /* turbopackIgnore: true */ mermaidUrl)
      .then((mod) => {
        if (cancelled) return
        const mermaid = mod.default
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        })
        mermaid.run({ querySelector: ".mermaid" })
      })
      .catch(() => {
        /* offline / CDN blocked — diagrams fall back to their source text */
      })
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
