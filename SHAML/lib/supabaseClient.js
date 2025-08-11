import { createClient } from '@supabase/supabase-js'

// Get the Supabase URL and Anon Key from your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// You can keep these here for reference if you like, but they are not used by the client itself.

// Database table names
export const TABLES = {
  JOBS: 'jobs',
  APPLICATIONS: 'applications',
  PROFILES: 'profiles', // Use the new profiles table
  USERS: 'users'
}

// Storage bucket names
export const STORAGE_BUCKETS = {
  RESUMES: 'resumes',
  JOB_DESCRIPTIONS: 'job_descriptions'
}
