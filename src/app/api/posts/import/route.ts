import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

type ImportBody = {
  slug?: string
  title?: string
  excerpt?: string
  image?: string
  content?: string
  published?: boolean
}

/**
 * Machine-to-machine endpoint that upserts a blog post from generated
 * markdown — the Post twin of /api/projects/import, so external repos can
 * publish long-form writeups without manual copy-paste into the admin form.
 *
 * The post is attributed to the earliest-created user (the site owner).
 *
 * Auth: `Authorization: Bearer <IMPORT_API_SECRET>`.
 */
export async function POST(req: Request) {
  const secret = process.env.IMPORT_API_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "IMPORT_API_SECRET is not configured" },
      { status: 500 },
    )
  }

  const auth = req.headers.get("authorization") ?? ""
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: ImportBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const slug = body.slug?.trim()
  const title = body.title?.trim()
  const content = body.content

  if (!slug || !title || !content) {
    return NextResponse.json(
      { error: "slug, title and content are required" },
      { status: 400 },
    )
  }

  const author =
    (await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true },
    })) ?? (await prisma.user.findFirst({ select: { id: true } }))
  if (!author) {
    return NextResponse.json(
      { error: "No user exists to attribute the post to" },
      { status: 500 },
    )
  }

  const data = {
    title,
    excerpt: body.excerpt ?? null,
    image: body.image ?? null,
    content,
    published: body.published ?? false,
  }

  const existing = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  })

  await prisma.post.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data, authorId: author.id },
  })

  revalidatePath("/blog")
  revalidatePath(`/blog/${slug}`)

  return NextResponse.json({
    ok: true,
    slug,
    action: existing ? "updated" : "created",
  })
}
