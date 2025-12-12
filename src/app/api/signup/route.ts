import db from '@/utils/supabaseUtil'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UserResponse } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const supabase = createClient()

  try {
    const authUser: UserResponse = await supabase.auth.getUser()

    if (authUser.error) {
      return NextResponse.json(
        { success: false, error: authUser.error.message },
        { status: 401 },
      )
    }

    if (!(authUser.data && authUser.data.user)) {
      return NextResponse.json(
        { success: false, error: 'User unauthenticated' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { firstName, email, occupation, goal, emailFrequency } = body

    await db.addProfile(
      firstName,
      email,
      occupation,
      goal,
      emailFrequency,
      authUser.data.user.id,
    )

    return NextResponse.json(
      { success: true, userId: authUser.data.user.id },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error signing up user', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred while signing up' },
      { status: 500 },
    )
  }
}



