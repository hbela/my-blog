'use client'

import { useState } from 'react'
import { saveProject } from '@/app/actions/project'
import Editor from './Editor'
import Link from 'next/link'

export default function ProjectForm({ project }: { project?: any }) {
  const [content, setContent] = useState(project?.content || '')

  return (
    <form action={saveProject.bind(null, project?.id || 'new')} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            type="text" 
            name="title" 
            defaultValue={project?.title || ''} 
            required 
            className="w-full border p-2 rounded" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input 
            type="text" 
            name="slug" 
            defaultValue={project?.slug || ''} 
            required 
            className="w-full border p-2 rounded" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Live URL (Optional)</label>
          <input 
            type="url" 
            name="liveUrl" 
            defaultValue={project?.liveUrl || ''} 
            className="w-full border p-2 rounded" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Source Code URL (Optional)</label>
          <input 
            type="url" 
            name="sourceUrl" 
            defaultValue={project?.sourceUrl || ''} 
            className="w-full border p-2 rounded" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Cover Image URL (Optional)</label>
          <input 
            type="text" 
            name="image" 
            defaultValue={project?.image || ''} 
            className="w-full border p-2 rounded" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Technologies (comma separated)</label>
          <input 
            type="text" 
            name="technologies" 
            placeholder="React, Next.js, Tailwind"
            defaultValue={project?.technologies || ''} 
            className="w-full border p-2 rounded" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea 
          name="excerpt" 
          defaultValue={project?.excerpt || ''} 
          className="w-full border p-2 rounded h-20" 
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
          defaultChecked={project?.published || false} 
          className="h-4 w-4" 
        />
        <label htmlFor="published" className="text-sm font-medium">Publish Project</label>
      </div>

      <div className="flex gap-4">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          {project ? 'Update Project' : 'Create Project'}
        </button>
        <Link href="/admin/projects" className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">
          Cancel
        </Link>
      </div>
    </form>
  )
}
