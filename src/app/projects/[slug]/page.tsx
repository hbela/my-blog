
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Image from "next/image"
import { marked } from "marked"

// Custom logic for Taskmanager project
function parseTaskmanagerContent(markdown: string) {
  const renderer = new marked.Renderer() as any;
  let sectionNumber = 0;
  
  renderer.heading = function(token: any) {
      if (token.depth === 2 && token.text.includes('Screen')) {
          sectionNumber++;
          // Generate a smooth ID based on text
          const sectionId = token.text.toLowerCase().replace(/<[^>]+>/g, '').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
          const spanText = String(sectionNumber).padStart(2, '0');
          const innerHtml = this.parser.parseInline(token.tokens);
          let html = (sectionNumber > 1 ? `</section>\n<hr />\n` : '') + 
                     `<section class="doc-section" id="${sectionId}">\n` +
                     `<div class="doc-section-header">\n` +
                     `<span class="doc-section-number">${spanText}</span>\n` +
                     `<h2>${innerHtml}</h2>\n` +
                     `</div>\n`;
          return html;
      }
      return `<h${token.depth}>${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
  };

  renderer.paragraph = function(token: any) {
      if (token.text.startsWith('*Note:')) {
          return `<div class="doc-callout doc-callout--info">\n<span class="callout-icon">💡</span>\n<p>${this.parser.parseInline(token.tokens)}</p>\n</div>\n`;
      }
      return `<p>${this.parser.parseInline(token.tokens)}</p>\n`; 
  };

  renderer.image = function(token: any) {
      const src = token.href.replace('docs/images-user-manual/', '/images-user-manual/');
      return `<div class="doc-screenshot">
  <div class="doc-screenshot-toolbar">
    <span class="dot"></span><span class="dot"></span><span class="dot"></span>
    <span class="label">Screenshot</span>
  </div>
  <img src="${src}" alt="${token.text || ''}" loading="lazy" />
</div>`;
  };

  marked.use({ renderer });
  let html = marked.parse(markdown);
  // Close the last section
  if (sectionNumber > 0) html += `</section>\n`;
  return html;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { slug: resolvedParams.slug, published: true }
  })

  if (!project) {
    notFound()
  }

  if (project.slug === 'taskmanager') {
    const htmlContent = parseTaskmanagerContent(project.content as string);
    
    return (
      <div className="taskmanager-doc-container">
        {/* Load the styles specific to this doc */}
        <link rel="stylesheet" href="/doc-theme/doc-theme.css" />
        
        <div className="doc-progress-bar"><div className="doc-progress-bar-inner"></div></div>
        <button className="doc-menu-toggle" aria-label="Toggle menu">☰</button>
        <div className="doc-overlay"></div>
        
        <aside className="doc-sidebar">
          <div className="doc-sidebar-brand">
            <h1><span className="brand-icon">T</span> Taskmanager</h1>
            <span className="brand-subtitle">User Manual v1.0</span>
          </div>
          <nav className="doc-sidebar-nav">
            <div className="doc-nav-group">
              <div className="doc-nav-group-title">Main Screens</div>
              <a href="#welcome-screen"><span className="doc-nav-number">01</span> Welcome Screen</a>
              <a href="#create-task-screen"><span className="doc-nav-number">02</span> Create Task</a>
              <a href="#task-list-screen"><span className="doc-nav-number">03</span> Task List</a>
              <a href="#task-details-screen"><span className="doc-nav-number">04</span> Task Details</a>
              <a href="#edit-task-screen"><span className="doc-nav-number">05</span> Edit Task</a>
              <a href="#calendar-screen"><span className="doc-nav-number">06</span> Calendar</a>
              <a href="#dashboard-screen"><span className="doc-nav-number">07</span> Dashboard</a>
              <a href="#settings-screen"><span className="doc-nav-number">08</span> Settings</a>
            </div>
          </nav>
          <div className="doc-sidebar-footer">© 2026 Taskmanager</div>
        </aside>

        <main className="doc-main">
          <header className="doc-header">
            <div className="doc-header-title"><strong>Taskmanager</strong>&nbsp; · &nbsp;Documentation</div>
          </header>
          <div className="doc-content">
            <div className="doc-hero">
              <div className="doc-hero-badge">📖 User Manual</div>
              <h1>Standalone Taskmanager<br />User Manual</h1>
              <p>A comprehensive guide on using the Standalone Taskmanager application.</p>
            </div>

            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

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

  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{project.title}</h1>
      <time className="text-gray-500 block mb-6 font-medium">
        {project.createdAt.toLocaleDateString()}
      </time>

      {project.image && (
        <div className="relative h-96 w-full mb-8 rounded-xl overflow-hidden shadow-lg border">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-10 border-b pb-8">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-blue-700 font-semibold transition"
          >
            Live Demo
          </a>
        )}
        {project.sourceUrl && (
          <a
            href={project.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-800 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-gray-900 font-semibold transition"
          >
            Source Code
          </a>
        )}
      </div>

      <div className="prose prose-lg max-w-none prose-blue">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {project.content}
        </ReactMarkdown>
      </div>
      
      {project.technologies && (
        <div className="mt-16 bg-gray-50 p-6 rounded-xl border">
          <h3 className="text-xl font-bold mb-4">Technologies Used</h3>
          <div className="flex flex-wrap gap-2">
            {project.technologies.split(',').map((tech, i) => (
              <span key={i} className="bg-white border text-gray-800 px-4 py-1.5 rounded-full font-medium shadow-sm">
                {tech.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
