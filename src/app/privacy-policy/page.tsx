import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  const filePath = path.join(process.cwd(), 'docs', 'LEGAL_COMPLIENCE.md')
  const html = fs.readFileSync(filePath, 'utf-8')

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
