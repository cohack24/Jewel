import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Welcome } from '@/components/emails/Welcome'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { email, firstName } = await req.json()

  const { data, error } = await resend.emails.send({
    from: 'Jewel <no-reply@usejewel.app>',
    to: [email],
    subject: 'Welcome to Jewel',
    react: Welcome({ firstName }),
  })

  if (error) {
    return NextResponse.json(error, { status: 400 })
  }

  return NextResponse.json(data, { status: 200 })
}



