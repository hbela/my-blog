import { prisma } from "@/lib/prisma"
import ProjectForm from "@/components/admin/ProjectForm"
import { notFound } from "next/navigation"

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await prisma.project.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Project: {project.title}</h1>
      <ProjectForm project={project} />
    </div>
  )
}
