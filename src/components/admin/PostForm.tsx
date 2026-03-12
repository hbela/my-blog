'use client'

import { useState } from 'react'
import { savePost } from '@/app/actions/post'
import Editor from './Editor'
import Link from 'next/link'

export default function PostForm({ post }: { post?: any }) {
  const [content, setContent] = useState(post?.content || '')

  return (
    <form action={savePost.bind(null, post?.id || 'new')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="text" name="title" defaultValue={post?.title || ''} required
            className="form-input" placeholder="My Awesome Post"
          />
        </div>
        <div>
          <label className="form-label">Slug <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input
            type="text" name="slug" defaultValue={post?.slug || ''} required
            className="form-input" placeholder="my-awesome-post"
          />
        </div>
      </div>

      <div>
        <label className="form-label">Excerpt</label>
        <textarea
          name="excerpt" defaultValue={post?.excerpt || ''}
          className="form-input"
          rows={3} placeholder="A short summary shown on the blog listing…"
          style={{ resize: 'vertical' }}
        />
      </div>

      <div>
        <label className="form-label">Cover Image URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
        <input
          type="text" name="image" defaultValue={post?.image || ''}
          className="form-input" placeholder="https://example.com/image.jpg"
        />
      </div>

      <div>
        <label className="form-label" style={{ marginBottom: '0.6rem' }}>Content <span style={{ color: 'var(--danger)' }}>*</span></label>
        <input type="hidden" name="content" value={content} />
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <Editor value={content} onChange={(v) => setContent(v || '')} />
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        background: 'var(--bg-secondary)',
        borderRadius: '10px',
        border: '1px solid var(--border)',
      }}>
        <label htmlFor="published" style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          cursor: 'pointer', userSelect: 'none',
        }}>
          <input
            type="checkbox" name="published" id="published" value="true"
            defaultChecked={post?.published || false}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Publish Post</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Make this post visible to the public</div>
          </div>
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/posts" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary">
            {post ? '✓ Update Post' : '+ Publish Post'}
          </button>
        </div>
      </div>
    </form>
  )
}
