'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type Comment = {
  id: string
  content: string
  createdAt: string
  author: { name: string | null; image: string | null }
}

export default function Comments({ postSlug }: { postSlug: string }) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch(`/api/comments/${postSlug}`)
      .then(r => r.json())
      .then(data => { setComments(data); setFetching(false) })
      .catch(() => setFetching(false))
  }, [postSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || !newComment.trim()) return
    setLoading(true)
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    })
    if (res.ok) {
      const comment = await res.json()
      setComments(prev => [comment, ...prev])
      setNewComment('')
    }
    setLoading(false)
  }

  return (
    <section>
      <h3 style={{
        fontSize: '1.3rem', fontWeight: 700,
        color: 'var(--text-primary)', marginBottom: '1.5rem',
        letterSpacing: '-0.02em',
      }}>
        {fetching ? '...' : `${comments.length} Comment${comments.length !== 1 ? 's' : ''}`}
      </h3>

      {/* Comment form / sign-in prompt */}
      {status === 'loading' ? null : status === 'authenticated' ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            {session.user?.image ? (
              <Image src={session.user.image} alt="You" width={36} height={36}
                style={{ borderRadius: '50%', flexShrink: 0, marginTop: '2px', border: '2px solid var(--border)' }} />
            ) : (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '0.9rem',
              }}>
                {(session.user?.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                required
                style={{ resize: 'vertical', marginBottom: '0.75rem' }}
              />
              <button type="submit" className="btn btn-primary" disabled={loading || !newComment.trim()}>
                {loading ? 'Posting…' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div style={{
          padding: '1.75rem', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center', marginBottom: '2.5rem',
        }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem' }}>
            Sign in to join the conversation.
          </p>
          <button className="btn btn-primary" onClick={() => signIn()}>
            Sign in to comment
          </button>
        </div>
      )}

      {/* Comments list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fetching
          ? [0,1].map(i => (
              <div key={i} style={{ height: '100px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', opacity: 0.5 }} />
            ))
          : comments.length === 0
            ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                No comments yet. Be the first!
              </p>
            )
            : comments.map(comment => (
              <div key={comment.id} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  {comment.author.image ? (
                    <Image src={comment.author.image} alt={comment.author.name || 'User'}
                      width={34} height={34}
                      style={{ borderRadius: '50%', border: '2px solid var(--border)' }} />
                  ) : (
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%',
                      background: 'var(--bg-tertiary)', color: 'var(--accent-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: '0.85rem', border: '2px solid var(--border)',
                    }}>
                      {(comment.author.name || 'A')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {comment.author.name || 'Anonymous'}
                    </span>
                    <time style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      {new Date(comment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </time>
                  </div>
                </div>
                <p style={{ color: '#c9d1d9', fontSize: '0.9rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </p>
              </div>
            ))}
      </div>
    </section>
  )
}
