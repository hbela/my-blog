import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-8 text-center bg-gray-50">
      <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6">
        Hi, I'm a Developer.
      </h1>
      <p className="max-w-2xl text-lg sm:text-xl text-gray-600 mb-10">
        Welcome to my professional portfolio and blog. Here I share my thoughts,
        tutorials, and the projects I have been working on.
      </p>
      <div className="flex gap-4">
        <Link
          href="/projects"
          className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          View Projects
        </Link>
        <Link
          href="/blog"
          className="bg-white text-gray-900 border border-gray-300 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transition"
        >
          Read Blog
        </Link>
      </div>
    </div>
  )
}
