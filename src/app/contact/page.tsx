'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const resData = await res.json()
      if (res.ok && resData.success) {
        setStatus('success')
        ;(e.target as HTMLFormElement).reset()
      } else {
        setStatus('error')
        setErrorMessage(resData.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Failed to send. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '4rem 1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: '99px', padding: '3px 12px',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-light)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem',
          }}>📬 Contact</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: 'var(--text-primary)', marginBottom: '0.75rem',
          }}>
            Get in Touch
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '380px', margin: '0 auto' }}>
            Have a project in mind or just want to say hi? Drop me a message.
          </p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label htmlFor="name" className="form-label">Full Name</label>
              <input id="name" name="name" type="text" placeholder="John Doe" required className="form-input" />
            </div>
            <div>
              <label htmlFor="email" className="form-label">Email Address</label>
              <input id="email" name="email" type="email" placeholder="john@example.com" required className="form-input" />
            </div>
            <div>
              <label htmlFor="message" className="form-label">Your Message</label>
              <textarea
                id="message" name="message"
                placeholder="How can I help you?"
                rows={6} required
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={status === 'loading'}
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', borderRadius: '10px', marginTop: '0.5rem' }}
            >
              {status === 'loading' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Sending…
                </span>
              ) : 'Send Message →'}
            </button>

            {status === 'success' && (
              <div style={{
                padding: '0.9rem 1.25rem', borderRadius: '10px',
                background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.3)',
                color: 'var(--success)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center',
              }}>
                ✓ Message sent successfully! I&apos;ll get back to you soon.
              </div>
            )}
            {status === 'error' && (
              <div style={{
                padding: '0.9rem 1.25rem', borderRadius: '10px',
                background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)',
                color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'center',
              }}>
                ✗ {errorMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
