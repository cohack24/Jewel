import { User, Session } from '@supabase/supabase-js';

interface Profile {
    id: number;
    firstname: string;
    email: string;
    occupation: string;
    created_at: string;
    goals: number; // Foreign key to goals table
    email_frequencies: number; // Foreign key to email_frequencies table
}

interface Goal {
    id: number;
    heading: string;
    description: string;
    created_at: string;
}

interface EmailFrequency {
    id: number;
    time_interval: string;
    created_at: string;
}

interface JournalEntry {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
}

interface AuthData {
    user: User;
    // session: Session;
}

export type { Profile, Goal, EmailFrequency, JournalEntry, AuthData };