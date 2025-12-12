import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string,
)

export async function POST(req: Request) {
  const { email, content } = await req.json()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert([{ user_id: user.id, content }])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(
    { message: 'Journal entry saved successfully', data },
    { status: 200 },
  )
}



