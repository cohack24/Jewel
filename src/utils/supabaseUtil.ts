import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseClient: SupabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

import { Profile, JournalEntry, Goal, EmailFrequency, AuthData } from '@/types/interfaces';
// Profiles
async function getAllProfiles(): Promise<Profile[]> {
	const { data, error } = await supabaseClient
		.from('profiles')
		.select('*');

	if (error) {
		throw error;
	}

	return data!;
}

async function getProfileById(id: number): Promise<Profile | null> {
	const { data, error } = await supabaseClient
		.from('profiles')
		.select('*')
		.eq('id', id)
		.single();

	if (error) {
		throw error;
	}

	return data;
}

async function addProfile(firstname: string, email: string, occupation: string, goalId: number, emailFrequnecyId: number): Promise<Profile | null> {
	const { data, error } = await supabaseClient
		.from('profiles')
		.insert([
			{
				firstname,
				email,
				occupation,
				goal_id: goalId,
				email_frequency_id: emailFrequnecyId,
			},
		])
		.single();

	if (error) {
		throw error;
	}

	return data;
}

async function deleteProfileById(id: number): Promise<void> {
	const { error } = await supabaseClient
		.from('profiles')
		.delete()
		.eq('id', id);

	if (error) {
		throw error;
	}
}

// Goals (Static Data)
async function getAllGoals(): Promise<Goal[]> {
	const { data, error } = await supabaseClient
		.from('goals')
		.select('*');

	if (error) {
		throw error;
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
		throw error;
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
		throw error;
	}

	return data;
}

// Message Frequencies (Static Data)
async function getAllEmailFrequencies(): Promise<EmailFrequency[]> {
	const { data, error } = await supabaseClient
		.from('email_frequencies')
		.select('*');

	if (error) {
		throw error;
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
		throw error;
	}

	return data;
}

// Journal Entries
async function getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
	const { data, error } = await supabaseClient
		.from('journal_entries')
		.select('*')
		.eq('user_id', userId);

	if (error) {
		throw error;
	}

	return data!;
}

async function addJournalEntry(userId: number, content: string): Promise<JournalEntry | null> {
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
		throw error;
	}

	return data;
}

async function deleteJournalEntryById(id: number): Promise<boolean> {
	const { error } = await supabaseClient
		.from('journal_entries')
		.delete()
		.eq('id', id);

	if (error) {
		throw error;
	}

	return true;
}

async function createUser(email: string, password: string): Promise<AuthData> {
	const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
    });

	console.log(data)

	if (error) {
        throw error;
    }

	// if (!data.user || !data.session) {
	// 	throw new Error('Failed to create user: Missing user or session data');
	// }

	if (!data.user) {
		throw new Error('Failed to create user: Missing user data');
	}
	
    return {
		user: data.user,
		// session: data.session,
	};
}

async function getAuthIdByEmail(email: string): Promise<string| null> {
	const {data, error} = await supabaseClient
		.from('auth.users')
		.select('id')
		.eq('email', email)
		.single();
	
	if (error) {
		throw error;
	}
	
	return data?.id || null;
}

async function verifyOtp(email: string, otpCode: string): Promise<boolean> {
    const { data, error } = await supabaseClient.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup',
    });

    if (error) {
        throw error;
    }

    return true;
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
	createUser,
	getAuthIdByEmail,
	verifyOtp,
};

export default db;
