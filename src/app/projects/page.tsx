import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-10 text-center">My Projects</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map(project => (
          <Link
            key={project.id}
            href={`/projects/${project.slug}`}
            className="group block border rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-white"
          >
            {project.image ? (
              <div className="relative h-56 w-full">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            ) : (
              <div className="relative h-56 w-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                <span className="text-blue-900 font-bold text-2xl opacity-75">{project.title}</span>
              </div>
            )}
            
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{project.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{project.excerpt}</p>
              
              <div className="flex flex-wrap gap-2">
                {project.technologies?.split(',').map((tech, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 col-span-3 text-center py-12 text-lg">No projects available.</p>
        )}
      </div>
    </div>
  )
}
