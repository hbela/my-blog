import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { deleteProject } from "@/app/actions/project"

export default async function AdminProjects() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <Link href="/admin/projects/new" className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">
          Create New Project
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map(project => (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{project.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${project.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {project.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{project.createdAt.toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right space-x-4">
                  <Link href={`/admin/projects/${project.id}`} className="text-blue-600 hover:text-blue-900">Edit</Link>
                  <form action={deleteProject.bind(null, project.id)} className="inline">
                    <button type="submit" className="text-red-600 hover:text-red-900">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
