# Supabase Setup Guide for HireWise

This guide will help you set up Supabase as the database for your HireWise recruitment platform.

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Note down your project URL and anon key

### 2. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=HireWise
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Database Schema

Run these SQL commands in your Supabase SQL editor:

```sql
-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create jobs table
CREATE TABLE jobs (
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
CREATE TABLE candidates (
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
CREATE TABLE applications (
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
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_candidates_email ON candidates(email);

-- Enable Row Level Security on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

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
```

### 4. Storage Buckets

Create storage buckets in your Supabase dashboard:

1. Go to Storage in your Supabase dashboard
2. Create a bucket called `resumes`
3. Create a bucket called `job_descriptions`
4. Set both buckets to public (for demo purposes)

Or run these SQL commands:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('job_descriptions', 'job_descriptions', true);

-- Create storage policies
CREATE POLICY "Resumes are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Anyone can update resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can delete resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes');

CREATE POLICY "Job descriptions are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can upload job descriptions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can update job descriptions" ON storage.objects FOR UPDATE USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can delete job descriptions" ON storage.objects FOR DELETE USING (bucket_id = 'job_descriptions');
```

### 5. Authentication Setup

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL: `http://localhost:3000`
3. Add redirect URLs: `http://localhost:3000/**`
4. Enable email confirmations (optional)

## 🔧 Testing the Setup

### 1. Test Database Connection

```bash
# Test the API endpoints
curl -X POST http://localhost:3000/api/create-vacancy \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","department":"Engineering","location":"Remote","description":"Test job","recruiterId":"test-recruiter"}'
```

### 2. Test File Upload

```bash
# Test resume upload
curl -X POST http://localhost:3000/api/applications \
  -F "jobId=your-job-id" \
  -F "candidateId=test-candidate" \
  -F "candidateName=Test User" \
  -F "candidateEmail=test@example.com" \
  -F "resume=@/path/to/test.pdf"
```

## 📊 Database Schema Overview

### Tables

1. **jobs** - Job postings
   - `id` (UUID, Primary Key)
   - `title` (TEXT)
   - `department` (TEXT)
   - `location` (TEXT)
   - `description` (TEXT)
   - `responsibilities` (TEXT[])
   - `requirements` (TEXT[])
   - `experience_years` (TEXT)
   - `salary` (TEXT)
   - `job_type` (TEXT)
   - `recruiter_id` (TEXT)
   - `skills` (TEXT[])
   - `status` (TEXT)

2. **candidates** - Candidate profiles
   - `id` (UUID, Primary Key)
   - `name` (TEXT)
   - `email` (TEXT, Unique)
   - `phone` (TEXT)
   - `location` (TEXT)
   - `experience` (TEXT)
   - `skills` (TEXT[])
   - `education` (TEXT)
   - `summary` (TEXT)
   - `role` (TEXT)
   - `key_strengths` (TEXT[])
   - `ai_suggestions` (TEXT[])

3. **applications** - Job applications
   - `id` (UUID, Primary Key)
   - `job_id` (UUID, Foreign Key)
   - `candidate_id` (UUID, Foreign Key)
   - `candidate_name` (TEXT)
   - `candidate_email` (TEXT)
   - `resume_url` (TEXT)
   - `resume_file_name` (TEXT)
   - `file_size` (INTEGER)
   - `match_score` (INTEGER)
   - `match_reason` (TEXT)
   - `status` (TEXT)
   - `notes` (TEXT)

### Storage Buckets

1. **resumes** - Resume file storage
2. **job_descriptions** - Job description file storage

## 🔐 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Public read access** for job listings and candidate profiles
- **Authenticated write access** for creating/updating records
- **Owner-based permissions** for updating/deleting records

## 🚨 Troubleshooting

### Common Issues

1. **Environment Variables Not Found**
   - Ensure `.env.local` file exists in project root
   - Restart the development server after adding environment variables

2. **Database Connection Errors**
   - Verify Supabase URL and anon key are correct
   - Check if your Supabase project is active

3. **Storage Upload Failures**
   - Ensure storage buckets are created
   - Check bucket permissions and policies
   - Verify file size limits

4. **RLS Policy Errors**
   - Check if RLS policies are properly configured
   - Verify user authentication status

### Debug Commands

```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/jobs" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

## 🎉 Success Indicators

✅ **Database**: Tables created and accessible
✅ **Storage**: Buckets created and file uploads working
✅ **Authentication**: User signup/login working
✅ **API**: All endpoints responding correctly
✅ **File Upload**: Resume uploads to Supabase Storage
✅ **Real-time**: Data updates reflect immediately

Your HireWise platform is now fully integrated with Supabase! 🚀 