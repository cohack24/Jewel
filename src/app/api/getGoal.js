import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    // Handle non-POST requests
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body; // Extract the email from the request body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Fetch the user from the 'profiles' table using the email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('goal_id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the goal from the 'goals' table using goal_id
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('heading, description')
      .eq('id', profile.goal_id)
      .single();

    if (goalError || !goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Respond with the goal details
    return res.status(200).json({ goal });

  } catch (error) {
    console.error('Error with Supabase:', error);
    return res.status(500).json({ error: 'Failed to fetch goal' });
  }
}
