import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

type ImportBody = {
  slug?: string
  title?: string
  excerpt?: string
  technologies?: string
  image?: string
  content?: string
  published?: boolean
  docTheme?: boolean
  brandIcon?: string
}

/**
 * Machine-to-machine endpoint that upserts a project from generated markdown.
 * Used by founder-sales-crm's `guide:publish` script to push a user guide
 * without manual copy-paste into the admin form.
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

  // Resolve relative screenshot references (assets/screenshots/*) to the
  // public-served path for this project's committed images — mirrors the
  // sunshine-dental seed script.
  const rewrittenContent = content.replace(
    /assets\/screenshots\//g,
    `/${slug}/`,
  )

  const data = {
    title,
    excerpt: body.excerpt ?? null,
    technologies: body.technologies ?? "",
    image: body.image ?? null,
    content: rewrittenContent,
    published: body.published ?? false,
    docTheme: body.docTheme ?? false,
    brandIcon: body.brandIcon ?? null,
  }

  const existing = await prisma.project.findUnique({
    where: { slug },
    select: { id: true },
  })

  await prisma.project.upsert({
    where: { slug },
    update: data,
    create: { slug, ...data },
  })

  revalidateTag("projects")
  revalidatePath("/projects")
  revalidatePath(`/projects/${slug}`)

  return NextResponse.json({
    ok: true,
    slug,
    action: existing ? "updated" : "created",
  })
}
