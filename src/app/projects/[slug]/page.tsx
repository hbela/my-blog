import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Image from "next/image"

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
