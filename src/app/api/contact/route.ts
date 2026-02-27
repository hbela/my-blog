import { Resend } from 'resend'
import { NextResponse } from 'next/server'

// Note: Ensure RESEND_API_KEY is defined in environment variables
const resend = new Resend(process.env.RESEND_API_KEY || "missing")

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>', // Update for production
      to: process.env.CONTACT_EMAIL || "admin@example.com",
      subject: `New message from ${name}`,
      replyTo: email,
      text: `Message from ${name} (${email}):\n\n${message}`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }
}
