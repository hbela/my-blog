'use server'
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"

export async function savePost(id: string | null, data: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized")

  const title = data.get("title") as string
  const slug = data.get("slug") as string
  const excerpt = data.get("excerpt") as string
  const content = data.get("content") as string
  const image = data.get("image") as string
  const published = data.get("published") === "true"

  if (id && id !== 'new') {
    await prisma.post.update({
      where: { id },
      data: { title, slug, excerpt, content, published, image }
    })
  } else {
    await prisma.post.create({
      data: { 
        title, 
        slug, 
        excerpt, 
        content, 
        published, 
        image,
        authorId: session.user.id
      }
    })
  }

  revalidateTag("posts")
  revalidatePath("/admin/posts")
  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)
  redirect("/admin/posts")
}

export async function deletePost(id: string) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') throw new Error("Unauthorized")

  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true } })
  await prisma.post.delete({ where: { id } })
  revalidateTag("posts")
  revalidatePath("/admin/posts")
  revalidatePath("/blog")
  if (post) revalidatePath(`/blog/${post.slug}`)
}
