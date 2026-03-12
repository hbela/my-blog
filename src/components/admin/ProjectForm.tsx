'use client'

import { useState } from 'react'
import { saveProject } from '@/app/actions/project'
import Editor from './Editor'
import Link from 'next/link'

export default function ProjectForm({ project }: { project?: any }) {
  const [content, setContent] = useState(project?.content || '')

  return (
    <form action={saveProject.bind(null, project?.id || 'new')} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label className="form-label">Title <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input type="text" name="title" defaultValue={project?.title || ''} required className="form-input" placeholder="My Project" />
        </div>
        <div>
          <label className="form-label">Slug <span style={{ color: 'var(--danger)' }}>*</span></label>
          <input type="text" name="slug" defaultValue={project?.slug || ''} required className="form-input" placeholder="my-project" />
        </div>
        <div>
          <label className="form-label">Live URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input type="url" name="liveUrl" defaultValue={project?.liveUrl || ''} className="form-input" placeholder="https://example.com" />
        </div>
        <div>
          <label className="form-label">Source Code URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input type="url" name="sourceUrl" defaultValue={project?.sourceUrl || ''} className="form-input" placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="form-label">Cover Image URL <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(optional)</span></label>
          <input type="text" name="image" defaultValue={project?.image || ''} className="form-input" placeholder="https://example.com/image.jpg" />
        </div>
        <div>
          <label className="form-label">Technologies <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>(comma-separated)</span></label>
          <input type="text" name="technologies" defaultValue={project?.technologies || ''} className="form-input" placeholder="React, Next.js, Tailwind" />
        </div>
      </div>

      <div>
        <label className="form-label">Excerpt</label>
        <textarea name="excerpt" defaultValue={project?.excerpt || ''} className="form-input" rows={3}
          placeholder="A short description shown on the projects listing…" style={{ resize: 'vertical' }} />
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
        <label htmlFor="published" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" name="published" id="published" value="true"
            defaultChecked={project?.published || false}
            style={{ width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Publish Project</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Make this project visible to the public</div>
          </div>
        </label>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/projects" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary">
            {project ? '✓ Update Project' : '+ Create Project'}
          </button>
        </div>
      </div>
    </form>
  )
}
