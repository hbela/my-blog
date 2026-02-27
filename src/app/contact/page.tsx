'use client'

import { useState } from 'react'

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
        e.currentTarget.reset()
      } else {
        setStatus('error')
        setErrorMessage(resData.error || 'Something went wrong')
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Failed to send request. Is the proxy blocking it?')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-20 pb-40">
      <h1 className="text-4xl font-extrabold mb-4 text-center">Get in Touch</h1>
      <p className="text-gray-600 text-center mb-10">Have a project in mind or just want to say hi? Drop me a message.</p>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              required
              className="w-full border-gray-300 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="john@example.com"
              required
              className="w-full border-gray-300 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Your Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="How can I help you?"
              rows={6}
              required
              className="w-full border-gray-300 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition outline-none resize-none"
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white font-bold px-6 py-4 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Sending Message...' : 'Send Message'}
          </button>
          
          {status === 'success' && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200 text-green-800 text-center font-medium">
              Message sent successfully! ✨
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200 text-red-800 text-center font-medium">
              {errorMessage}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
