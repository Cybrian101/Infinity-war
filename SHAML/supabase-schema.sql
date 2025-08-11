-- HireWise Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  experience_years TEXT DEFAULT '0',
  salary TEXT DEFAULT '',
  job_type TEXT DEFAULT 'Full-time',
  recruiter_id TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  location TEXT DEFAULT '',
  experience TEXT DEFAULT '',
  skills TEXT[] DEFAULT '{}',
  education TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  role TEXT DEFAULT 'Software Developer',
  key_strengths TEXT[] DEFAULT '{}',
  ai_suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);

-- Enable Row Level Security on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Jobs are insertable by authenticated users" ON jobs;
DROP POLICY IF EXISTS "Jobs are updatable by owner" ON jobs;
DROP POLICY IF EXISTS "Jobs are deletable by owner" ON jobs;

DROP POLICY IF EXISTS "Candidates are viewable by everyone" ON candidates;
DROP POLICY IF EXISTS "Candidates are insertable by authenticated users" ON candidates;
DROP POLICY IF EXISTS "Candidates are updatable by owner" ON candidates;
DROP POLICY IF EXISTS "Candidates are deletable by owner" ON candidates;

DROP POLICY IF EXISTS "Applications are viewable by everyone" ON applications;
DROP POLICY IF EXISTS "Applications are insertable by authenticated users" ON applications;
DROP POLICY IF EXISTS "Applications are updatable by owner" ON applications;
DROP POLICY IF EXISTS "Applications are deletable by owner" ON applications;

-- Create RLS policies
-- Jobs: Anyone can read, only authenticated users can create/update/delete
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs are insertable by authenticated users" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Jobs are updatable by owner" ON jobs FOR UPDATE USING (auth.uid()::text = recruiter_id);
CREATE POLICY "Jobs are deletable by owner" ON jobs FOR DELETE USING (auth.uid()::text = recruiter_id);

-- Candidates: Anyone can read, only authenticated users can create/update/delete
CREATE POLICY "Candidates are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Candidates are insertable by authenticated users" ON candidates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Candidates are updatable by owner" ON candidates FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Candidates are deletable by owner" ON candidates FOR DELETE USING (auth.uid()::text = id::text);

-- Applications: Anyone can read, only authenticated users can create/update/delete
CREATE POLICY "Applications are viewable by everyone" ON applications FOR SELECT USING (true);
CREATE POLICY "Applications are insertable by authenticated users" ON applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Applications are updatable by owner" ON applications FOR UPDATE USING (auth.uid()::text = candidate_id::text);
CREATE POLICY "Applications are deletable by owner" ON applications FOR DELETE USING (auth.uid()::text = candidate_id::text);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('job_descriptions', 'job_descriptions', true) ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Resumes are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update resumes" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete resumes" ON storage.objects;

DROP POLICY IF EXISTS "Job descriptions are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload job descriptions" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update job descriptions" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete job descriptions" ON storage.objects;

-- Create storage policies
CREATE POLICY "Resumes are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Anyone can update resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can delete resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes');

CREATE POLICY "Job descriptions are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can upload job descriptions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can update job descriptions" ON storage.objects FOR UPDATE USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can delete job descriptions" ON storage.objects FOR DELETE USING (bucket_id = 'job_descriptions');

-- Insert some sample data for testing
INSERT INTO jobs (title, department, location, description, recruiter_id, skills) VALUES 
('Software Engineer', 'Engineering', 'Remote', 'We are looking for a talented software engineer to join our team.', 'recruiter1', ARRAY['JavaScript', 'React', 'Node.js']),
('Product Manager', 'Product', 'San Francisco', 'Lead product development and strategy for our platform.', 'recruiter1', ARRAY['Product Management', 'Agile', 'User Research']),
('UX Designer', 'Design', 'New York', 'Create beautiful and intuitive user experiences.', 'recruiter2', ARRAY['Figma', 'User Research', 'Prototyping']);

INSERT INTO candidates (name, email, phone, location, experience, skills, role) VALUES 
('John Doe', 'john@example.com', '+1234567890', 'San Francisco', '5 years of software development', ARRAY['JavaScript', 'React', 'Python'], 'Software Engineer'),
('Jane Smith', 'jane@example.com', '+1234567891', 'New York', '3 years of product management', ARRAY['Product Management', 'Agile', 'Analytics'], 'Product Manager'),
('Mike Johnson', 'mike@example.com', '+1234567892', 'Remote', '4 years of UX design', ARRAY['Figma', 'Sketch', 'User Research'], 'UX Designer');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as jobs_count FROM jobs;
SELECT COUNT(*) as candidates_count FROM candidates; 