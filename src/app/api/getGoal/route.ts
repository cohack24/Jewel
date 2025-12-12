import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string,
)

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('goal_id')
      .eq('email', email)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('heading, description')
      .eq('id', profile.goal_id)
      .single()

    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    return NextResponse.json({ goal }, { status: 200 })
  } catch (error) {
    console.error('Error with Supabase:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goal' },
      { status: 500 },
    )
  }
}



