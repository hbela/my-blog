import PostForm from "@/components/admin/PostForm"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create New Post" }

export default function NewPostPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/posts" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Posts
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
          Create New Post
        </h1>
      </div>
      <PostForm />
    </div>
  )
}
