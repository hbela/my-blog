'use client'

import { useSession, signIn } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type Comment = {
  id: string
  content: string
  createdAt: string
  author: {
    name: string | null
    image: string | null
  }
}

export default function Comments({ postSlug }: { postSlug: string }) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/comments/${postSlug}`)
      .then((res) => res.json())
      .then(setComments)
  }, [postSlug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return

    setLoading(true)
    const res = await fetch(`/api/comments/${postSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    })
    
    if (res.ok) {
      const comment = await res.json()
      setComments((prev) => [comment, ...prev])
      setNewComment('')
    }
    setLoading(false)
  }

  return (
    <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold mb-6">Comments</h3>
      
      {status === 'authenticated' ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            className="w-full border-gray-300 border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
            rows={4}
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 bg-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg text-center shadow-sm">
          <p className="text-gray-600 font-medium mb-3">Join the conversation</p>
          <button
            onClick={() => signIn()}
            className="bg-gray-900 text-white font-medium px-6 py-2 rounded-lg shadow hover:bg-gray-800 transition"
          >
            Sign in to comment
          </button>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {comment.author.image ? (
                <Image
                  src={comment.author.image}
                  alt={comment.author.name || 'User'}
                  width={40}
                  height={40}
                  className="rounded-full shadow-sm"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {(comment.author.name || 'A')[0].toUpperCase()}
                </div>
              )}
              <div>
                <span className="font-semibold block">{comment.author.name || 'Anonymous'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{comment.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500 italic text-center py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  )
}
