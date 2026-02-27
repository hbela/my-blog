import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const comments = await prisma.comment.findMany({
    where: { postSlug: resolvedParams.slug },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(comments)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { content } = await req.json()
  if (!content || content.trim() === '') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      postSlug: resolvedParams.slug,
      author: { connect: { email: session.user.email } },
    },
    include: { author: { select: { name: true, image: true } } },
  })

  return NextResponse.json(comment, { status: 201 })
}
