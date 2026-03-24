'use server'
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function saveProject(id: string | null, data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized")

  const title = data.get("title") as string
  const slug = data.get("slug") as string
  const excerpt = data.get("excerpt") as string
  const content = data.get("content") as string
  const image = data.get("image") as string
  const liveUrl = data.get("liveUrl") as string
  const sourceUrl = data.get("sourceUrl") as string
  const technologies = data.get("technologies") as string
  const published = data.get("published") === "true"

  if (id && id !== 'new') {
    await prisma.project.update({
      where: { id },
      data: { title, slug, excerpt, content, published, image, liveUrl, sourceUrl, technologies }
    })
  } else {
    await prisma.project.create({
      data: { title, slug, excerpt, content, published, image, liveUrl, sourceUrl, technologies }
    })
  }

  revalidateTag("projects")
  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)
  redirect("/admin/projects")
}

export async function deleteProject(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized")

  const project = await prisma.project.findUnique({ where: { id }, select: { slug: true } })
  await prisma.project.delete({ where: { id } })
  revalidateTag("projects")
  revalidatePath("/admin/projects")
  revalidatePath("/projects")
  if (project) revalidatePath(`/projects/${project.slug}`)
}
