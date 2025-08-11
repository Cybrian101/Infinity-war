Updated query
-- HireWise Database Schema for Supabase
-- VERSION: Simplified Profiles (with Storage Policy Fix)
-- Run this in your Supabase SQL Editor

-- Create a simplified table for public user profiles
DROP TABLE IF EXISTS public.profiles CASCADE; -- Drop old table and dependencies
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  full_name TEXT,
  role TEXT DEFAULT 'candidate', -- Default role is 'candidate'

  CONSTRAINT role_check CHECK (role IN ('candidate', 'recruiter', 'admin'))
);

-- Set up Row Level Security (RLS) for the new profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- This trigger automatically creates a simplified profile for new users.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'candidate' -- Default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Recreate jobs and applications tables to link to the new profiles table
DROP TABLE IF EXISTS public.jobs CASCADE;
CREATE TABLE public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  experience_years TEXT DEFAULT '0',
  salary TEXT DEFAULT '',
  job_type TEXT DEFAULT 'Full-time',
  recruiter_id uuid REFERENCES profiles(id),
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP TABLE IF EXISTS public.applications CASCADE;
CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  resume_url TEXT,
  resume_file_name TEXT,
  file_size INTEGER DEFAULT 0,
  match_score INTEGER DEFAULT 0,
  match_reason TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  notes TEXT DEFAULT '',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes and policies
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Job Policies
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Jobs are insertable by recruiters or admins" ON jobs;
DROP POLICY IF EXISTS "Jobs are updatable by recruiters or admins" ON jobs;
DROP POLICY IF EXISTS "Jobs are deletable by recruiters or admins" ON jobs;

CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs are insertable by recruiters or admins" ON jobs FOR INSERT WITH CHECK (public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Jobs are updatable by recruiters or admins" ON jobs FOR UPDATE USING (public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Jobs are deletable by recruiters or admins" ON jobs FOR DELETE USING (public.get_user_role() IN ('recruiter', 'admin'));

-- Application Policies
DROP POLICY IF EXISTS "Applications are viewable by relevant users" ON applications;
DROP POLICY IF EXISTS "Candidates can create applications" ON applications;

CREATE POLICY "Applications are viewable by relevant users" ON applications FOR SELECT USING (auth.uid() = candidate_id OR public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Candidates can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);

-- Storage buckets and policies remain the same
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('job_descriptions', 'job_descriptions', true) ON CONFLICT (id) DO NOTHING;

-- FIX: Drop existing storage policies before creating new ones
DROP POLICY IF EXISTS "Resumes are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Job descriptions are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload job descriptions" ON storage.objects;

CREATE POLICY "Resumes are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Job descriptions are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can upload job descriptions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job_descriptions');

SELECT 'Simplified database setup completed successfully!' as status;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    'candidate' -- Sets the default role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();




  -- Drop the existing jobs table and its dependencies (like applications) to recreate it cleanly
DROP TABLE IF EXISTS public.jobs CASCADE;

-- Drop the applications table explicitly to prevent errors if it exists independently
DROP TABLE IF EXISTS public.applications CASCADE;

-- Create the new jobs table with the correct column names
CREATE TABLE public.jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  experience_years TEXT DEFAULT '0', -- Note: Matches the form and AI output
  salary TEXT DEFAULT '',
  job_type TEXT DEFAULT 'Full-time',
  recruiter_id uuid REFERENCES profiles(id),
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate any necessary indexes
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);

-- Re-enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Re-apply the security policies
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs are insertable by recruiters or admins" ON jobs FOR INSERT 
  WITH CHECK (public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Jobs are updatable by recruiters or admins" ON jobs FOR UPDATE 
  USING (public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Jobs are deletable by recruiters or admins" ON jobs FOR DELETE 
  USING (public.get_user_role() IN ('recruiter', 'admin'));

-- You will need to recreate the applications table as well since it was dropped with CASCADE
CREATE TABLE public.applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  resume_url TEXT,
  resume_file_name TEXT,
  file_size INTEGER DEFAULT 0,
  match_score INTEGER DEFAULT 0,
  match_reason TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  notes TEXT DEFAULT '',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Re-enable RLS and policies for applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applications are viewable by relevant users" ON applications FOR SELECT USING (auth.uid() = candidate_id OR public.get_user_role() IN ('recruiter', 'admin'));
CREATE POLICY "Candidates can create applications" ON applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);

SELECT 'Jobs and Applications tables have been successfully updated!' as status;