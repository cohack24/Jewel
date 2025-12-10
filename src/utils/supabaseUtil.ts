import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseClient: SupabaseClient = createClient(
	process.env.SUPABASE_URL,
	process.env.SUPABASE_KEY,
);

interface Profile {
	id: string; // uuid, references auth.users.id
	first_name: string | null;
	email: string | null;
	created_at: string;
	goal_id: number | null; // Foreign key to goals table
	email_frequency_id: number | null; // Foreign key to email_frequencies table
}

interface Goal {
	id: number;
	heading: string;
	description: string;
	created_at: string;
}

interface EmailFrequency {
	id: number;
	time_interval_label: string | null;
	interval_seconds: number | null;
	created_at: string;
}

interface JournalEntry {
	id: number;
	user_id: string; // uuid, references public.users.id
	content: string;
	created_at: string;
}

// Users (previously named "profiles" in the code)
async function getAllProfiles(): Promise<Profile[]> {
	const { data, error } = await supabaseClient
		.from('users')
		.select('*');

	if (error) {
		throw new Error(`Error fetching profiles: ${error.message}`);
	}

	return data!;
}

async function getProfileById(id: number): Promise<Profile | null> {
	const { data, error } = await supabaseClient
		.from('users')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		throw new Error(`Error fetching profile by ID (${id}): ${error.message}`);
	}

	return data;
}

async function addProfile(firstname: string, email: string, occupation: string, goalId: number, emailFrequnecyId: number, authUserId: string): Promise<Profile | null> {
	const { data, error } = await supabaseClient
		.from('users')
		.insert([
			{
				// Use the auth user's id so this row is linked to auth.users
				id: authUserId,
				first_name: firstname,
				email,
				goal_id: goalId,
				email_frequency_id: emailFrequnecyId,
			},
		])
		.single();

	if (error) {
		throw new Error(`Error adding profile: ${error.message}`);
	}

	return data;
}

async function deleteProfileById(id: number): Promise<void> {
	const { error } = await supabaseClient
		.from('users')
		.delete()
		.eq('id', id);

	if (error) {
		throw new Error(`Error deleting profile by ID (${id}): ${error.message}`);
	}

}

// Goals (Static Data)
async function getAllGoals(): Promise<Goal[]> {
	const { data, error } = await supabaseClient
		.from('goals')
		.select('*');

	if (error) {
		throw new Error(`Error fetching goals: ${error.message}`);
	}

	return data!;
}

async function getGoalById(id: number): Promise<Goal | null> {
	const { data, error } = await supabaseClient
		.from('goals')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		throw new Error(`Error fetching goal by ID (${id}): ${error.message}`);
	}

	return data;
}

async function getGoalByHeading(heading: string): Promise<Goal | null> {
	const { data, error } = await supabaseClient
		.from('goals')
		.select('*')
		.eq('heading', heading)
		.single();

	if (error) {
		throw new Error(`Error fetching goal by heading (${heading}): ${error.message}`);
	}

	return data;
}

// Message Frequencies (Static Data)
async function getAllEmailFrequencies(): Promise<EmailFrequency[]> {
	const { data, error } = await supabaseClient
		.from('email_frequencies')
		.select('*');

	if (error) {
		throw new Error(`Error fetching message frequencies: ${error.message}`);
	}

	return data!;
}

async function getEmailFrequencyById(id: number): Promise<EmailFrequency | null> {
	const { data, error } = await supabaseClient
		.from('email_frequencies')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		throw new Error(`Error fetching message frequency by ID (${id}): ${error.message}`);
	}

	return data;
}

// Journal Entries
async function getJournalEntriesByUserId(userId: string): Promise<JournalEntry[]> {
	const { data, error } = await supabaseClient
		.from('journal_entries')
		.select('*')
		.eq('user_id', userId);

	if (error) {
		throw new Error(`Error fetching journal entries for user ID (${userId}): ${error.message}`);
	}

	return data!;
}

async function addJournalEntry(userId: string, content: string): Promise<JournalEntry | null> {
	const { data, error } = await supabaseClient
		.from('journal_entries')
		.insert([
			{
				user_id: userId,
				content,
			},
		])
		.single();

	if (error) {
		throw new Error(`Error adding journal entry for user ID (${userId}): ${error.message}`);
	}

	return data;
}

async function deleteJournalEntryById(id: number): Promise<boolean> {
	const { error } = await supabaseClient
		.from('journal_entries')
		.delete()
		.eq('id', id);

	if (error) {
		throw new Error(`Error deleting journal entry by ID (${id}): ${error.message}`);
	}

	return true;
}

async function createVerificationCode(authUserId: string): Promise<string> {
	// Generate a 6-digit random verification code
	const code = Math.floor(100000 + Math.random() * 900000).toString();

	// Insert the code into the verification_codes table
	const { data, error } = await supabaseClient.from('verification_codes').insert([
		{
			user_id: authUserId,
			code,
			expires_at: new Date(Date.now() + 15 * 60 * 1000), // Code expires in 15 minutes
		},
	]);

	if (error) {
		throw new Error(`Error creating verification code: ${error.message}`);
	}

	// Return the generated code
	return code;
}


const db = {
	getAllProfiles,
	getProfileById,
	addProfile,
	deleteProfileById,
	getAllGoals,
	getGoalById,
	getGoalByHeading,
	getAllEmailFrequencies,
	getEmailFrequencyById,
	getJournalEntriesByUserId,
	addJournalEntry,
	deleteJournalEntryById,
	createVerificationCode,
};

export default db;
