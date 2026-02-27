'use client'

import dynamic from 'next/dynamic'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
)

export default function Editor({ value, onChange }: { value: string, onChange: (val?: string) => void }) {
  return (
    <div data-color-mode="light">
      <MDEditor value={value} onChange={onChange} height={400} />
    </div>
  )
}
