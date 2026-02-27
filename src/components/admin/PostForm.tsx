'use client'

import { useState } from 'react'
import { savePost } from '@/app/actions/post'
import Editor from './Editor'
import Link from 'next/link'

export default function PostForm({ post }: { post?: any }) {
  const [content, setContent] = useState(post?.content || '')

  return (
    <form action={savePost.bind(null, post?.id || 'new')} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input 
          type="text" 
          name="title" 
          defaultValue={post?.title || ''} 
          required 
          className="w-full border p-2 rounded" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input 
          type="text" 
          name="slug" 
          defaultValue={post?.slug || ''} 
          required 
          className="w-full border p-2 rounded" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea 
          name="excerpt" 
          defaultValue={post?.excerpt || ''} 
          className="w-full border p-2 rounded h-20" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Cover Image URL (Optional)</label>
        <input 
          type="text" 
          name="image" 
          defaultValue={post?.image || ''} 
          className="w-full border p-2 rounded" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <input type="hidden" name="content" value={content} />
        <Editor value={content} onChange={(v) => setContent(v || '')} />
      </div>

      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          name="published" 
          id="published" 
          value="true" 
          defaultChecked={post?.published || false} 
          className="h-4 w-4" 
        />
        <label htmlFor="published" className="text-sm font-medium">Publish Post</label>
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {post ? 'Update Post' : 'Create Post'}
        </button>
        <Link href="/admin/posts" className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">
          Cancel
        </Link>
      </div>
    </form>
  )
}
