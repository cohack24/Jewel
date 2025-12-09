import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, content } = req.body;

    console.log(email);

    // Fetch the user's ID based on the email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'User not found' });
    }

    // Insert the journal entry with the found user ID
    const { data, error } = await supabase
      .from('journal_entries')
      .insert([{ user_id: user.id, content }]);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Journal entry saved successfully', data });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
