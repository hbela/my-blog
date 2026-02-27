'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Portfolio
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Blog
          </Link>
          <Link href="/projects" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Projects
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-blue-600 transition-colors">
            Contact
          </Link>

          {session?.user && (
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-blue-600">
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
