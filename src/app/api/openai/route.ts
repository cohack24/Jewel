import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'
import { calculateDateRange } from '@/utils/dateUtils'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string,
)

const fetchUserProfile = async (email: string) => {
  const { data: profile, error } = await supabase
    .from('users')
    .select('id, first_name, goal_id, email_frequency_id')
    .eq('email', email)
    .single()

  return { profile, error }
}

const fetchGoal = async (goal_id: number) => {
  const { data: goal, error } = await supabase
    .from('goals')
    .select('heading')
    .eq('id', goal_id)
    .single()

  return { goal, error }
}

const fetchEmailFrequency = async (email_frequency_id: number) => {
  const { data: emailFrequency, error } = await supabase
    .from('email_frequencies')
    .select('time_interval_label')
    .eq('id', email_frequency_id)
    .single()

  return { emailFrequency, error }
}

const fetchJournalEntries = async (user_id: string) => {
  const { data: journalEntries, error } = await supabase
    .from('journal_entries')
    .select('content, created_at')
    .eq('user_id', user_id)
    .order('created_at', { ascending: true })

  return { journalEntries, error }
}

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const { profile, error: profileError } = await fetchUserProfile(email)
  if (profileError || !profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { goal, error: goalError } = await fetchGoal(profile.goal_id)
  if (goalError || !goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
  }

  const {
    emailFrequency,
    error: emailFrequencyError,
  } = await fetchEmailFrequency(profile.email_frequency_id)
  if (emailFrequencyError || !emailFrequency) {
    return NextResponse.json(
      { error: 'Message frequency not found' },
      { status: 404 },
    )
  }

  const { journalEntries, error: journalError } = await fetchJournalEntries(
    profile.id,
  )
  if (journalError) {
    return NextResponse.json(
      { error: 'Failed to fetch journal entries' },
      { status: 500 },
    )
  }

  if (!journalEntries || journalEntries.length === 0) {
    return NextResponse.json(
      { error: 'No journal entries found' },
      { status: 404 },
    )
  }

  let userMessage = `Goal: ${goal.heading} - Tailored for users who need to organize their workday better and track task completion. Prompts will help them focus on what’s been accomplished and how to be more efficient.\n\nJournal Entries:\n\n`
  journalEntries.forEach((entry, index) => {
    userMessage += `${index + 1}. Entry: ${entry.content}\n\n`
  })

  const { startDate, endDate } = calculateDateRange(
    emailFrequency.time_interval_label,
  )

  const systemMessage = `
  You are an AI assistant tasked with summarizing a user's journal entries for their progress report. 
  The user has chosen a ${emailFrequency.time_interval_label} summary format, focusing on the goal: '${goal.heading}'.
  Generate a structured summary in JSON format with the following properties:

  {
    "firstName": "${profile.first_name}",
    "startDate": "${startDate}",
    "endDate": "${endDate}",
    "selectedGoal": ${goal.heading},
    "goalImportance": "This goal helps you enhance your efficiency and achieve your daily tasks more effectively.",
    "tasksCompleted": "[Highlight significant tasks or milestones achieved by the user, emphasizing their impact or challenge level.]",
    "challengesFaced": "[Provide an overview of notable challenges, both practical and emotional, that affected the user’s progress.]",
    "timeManagement": "[Reflect on how the user allocated their time, providing insights on effective and ineffective time use.]",
    "collaboration": "[Offer feedback on the user's interactions with others, support received, and social aspects of their work.]",
    "suggestions": "[Provide personalized recommendations aligned with the user’s goal, helping them optimize their progress.]",
    "emotionalWellbeing": "[Include reflections on the user’s emotional state during the period, highlighting moments of uncertainty, confidence, or self-reflection.]",
    "conclusion": "[Wrap up the insights, reinforcing the progress made and encouraging continued journaling and reflection.]"
  }

  Ensure that the content is filled in according to the provided journal entries and user data. Maintain a friendly and supportive tone throughout, focusing on constructive feedback and actionable advice.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
    })

    return NextResponse.json(
      { result: response.choices[0].message?.content },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error with OpenAI API or email:', error)
    return NextResponse.json(
      { error: 'Failed to generate completion or send email' },
      { status: 500 },
    )
  }
}



