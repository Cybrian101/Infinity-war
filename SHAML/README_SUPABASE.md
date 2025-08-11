# HireWise with Supabase Integration

This document provides a complete guide for setting up and using HireWise with Supabase as the backend database.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js
```

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=HireWise
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create tables
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

-- Create indexes
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_candidates_email ON candidates(email);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Jobs are viewable by everyone" ON jobs FOR SELECT USING (true);
CREATE POLICY "Jobs are insertable by authenticated users" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Jobs are updatable by owner" ON jobs FOR UPDATE USING (auth.uid()::text = recruiter_id);
CREATE POLICY "Jobs are deletable by owner" ON jobs FOR DELETE USING (auth.uid()::text = recruiter_id);

CREATE POLICY "Candidates are viewable by everyone" ON candidates FOR SELECT USING (true);
CREATE POLICY "Candidates are insertable by authenticated users" ON candidates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Candidates are updatable by owner" ON candidates FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Candidates are deletable by owner" ON candidates FOR DELETE USING (auth.uid()::text = id::text);

CREATE POLICY "Applications are viewable by everyone" ON applications FOR SELECT USING (true);
CREATE POLICY "Applications are insertable by authenticated users" ON applications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Applications are updatable by owner" ON applications FOR UPDATE USING (auth.uid()::text = candidate_id::text);
CREATE POLICY "Applications are deletable by owner" ON applications FOR DELETE USING (auth.uid()::text = candidate_id::text);
```

### 4. Storage Setup

Create storage buckets in your Supabase dashboard:

1. Go to Storage in your Supabase dashboard
2. Create bucket: `resumes`
3. Create bucket: `job_descriptions`
4. Set both to public

Or run these SQL commands:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('job_descriptions', 'job_descriptions', true);

CREATE POLICY "Resumes are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can upload resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes');
CREATE POLICY "Anyone can update resumes" ON storage.objects FOR UPDATE USING (bucket_id = 'resumes');
CREATE POLICY "Anyone can delete resumes" ON storage.objects FOR DELETE USING (bucket_id = 'resumes');

CREATE POLICY "Job descriptions are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can upload job descriptions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can update job descriptions" ON storage.objects FOR UPDATE USING (bucket_id = 'job_descriptions');
CREATE POLICY "Anyone can delete job descriptions" ON storage.objects FOR DELETE USING (bucket_id = 'job_descriptions');
```

## 📁 File Structure

```
lib/
├── supabaseClient.js          # Supabase client configuration
├── supabaseDatabase.js        # Database service layer
contexts/
├── AuthContext.js             # Authentication context (updated for Supabase)
├── JobContext.js              # Job management context (updated for Supabase)
├── ApplicationContext.js       # Application management context (updated for Supabase)
pages/api/
├── create-vacancy.js          # Job creation API (updated for Supabase)
├── jobs.js                    # Job management API (updated for Supabase)
├── applications.js            # Application management API (updated for Supabase)
├── candidates.js              # Candidate management API (updated for Supabase)
├── match-candidates.js        # AI matching API (updated for Supabase)
```

## 🔧 Key Features

### 1. Authentication
- **Supabase Auth** for user management
- **Email/Password** authentication
- **Session management** with automatic token refresh
- **Password reset** functionality

### 2. Database Operations
- **Real-time data** with Supabase subscriptions
- **Row Level Security (RLS)** for data protection
- **Automatic UUID generation** for all records
- **Foreign key relationships** with cascade deletes

### 3. File Storage
- **Supabase Storage** for resume uploads
- **Automatic file validation** (PDF, DOC, DOCX)
- **Unique filename generation** to prevent conflicts
- **Public URLs** for easy file access

### 4. API Integration
- **RESTful API endpoints** for all operations
- **Error handling** with detailed error messages
- **File upload support** with FormData
- **Batch operations** for efficiency

## 🎯 Usage Examples

### Creating a Job

```javascript
import { useJobs } from '../contexts/JobContext'

const { createJob } = useJobs()

const handleCreateJob = async () => {
  const result = await createJob({
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    description: 'We are looking for a talented developer...',
    recruiterId: 'user-123',
    skills: ['JavaScript', 'React', 'Node.js']
  })
  
  if (result.success) {
    console.log('Job created:', result.job)
  }
}
```

### Applying to a Job

```javascript
import { useApplications } from '../contexts/ApplicationContext'

const { applyToJob } = useApplications()

const handleApply = async () => {
  const result = await applyToJob({
    jobId: 'job-uuid',
    candidateId: 'candidate-uuid',
    candidateName: 'John Doe',
    candidateEmail: 'john@example.com',
    resume: fileObject
  })
  
  if (result.success) {
    console.log('Application submitted:', result.application)
  }
}
```

### User Authentication

```javascript
import { useAuth } from '../contexts/AuthContext'

const { signIn, signUp, signOut, user } = useAuth()

// Sign up
const handleSignUp = async () => {
  const result = await signUp('user@example.com', 'password123', {
    name: 'John Doe',
    role: 'candidate'
  })
}

// Sign in
const handleSignIn = async () => {
  const result = await signIn('user@example.com', 'password123')
}

// Sign out
const handleSignOut = async () => {
  await signOut()
}
```

## 🔐 Security Features

### Row Level Security (RLS)
- **Public read access** for job listings and candidate profiles
- **Authenticated write access** for creating/updating records
- **Owner-based permissions** for updating/deleting records

### File Upload Security
- **File type validation** (PDF, DOC, DOCX only)
- **File size limits** (10MB max)
- **Unique filename generation** to prevent conflicts
- **Public bucket access** for demo purposes

### Authentication Security
- **Email verification** (optional)
- **Password strength requirements**
- **Session management** with automatic token refresh
- **Secure token storage**

## 🚨 Error Handling

### Common Error Scenarios

1. **Database Connection Errors**
   ```javascript
   try {
     const jobs = await JobsService.getAllJobs()
   } catch (error) {
     console.error('Database error:', error.message)
   }
   ```

2. **File Upload Errors**
   ```javascript
   try {
     const result = await applyToJob(applicationData)
   } catch (error) {
     console.error('Upload error:', error.message)
   }
   ```

3. **Authentication Errors**
   ```javascript
   try {
     const result = await signIn(email, password)
   } catch (error) {
     console.error('Auth error:', error.message)
   }
   ```

### Error Recovery

- **Automatic retry** for network issues
- **Fallback data** when API calls fail
- **User-friendly error messages**
- **Graceful degradation** for offline scenarios

## 📊 Performance Optimization

### Database Optimization
- **Indexed queries** for faster searches
- **Pagination support** for large datasets
- **Selective field loading** to reduce data transfer
- **Connection pooling** for better performance

### File Storage Optimization
- **Compression** for uploaded files
- **CDN delivery** for faster file access
- **Lazy loading** for file previews
- **Thumbnail generation** for images

### Frontend Optimization
- **React Context** for state management
- **Memoization** for expensive calculations
- **Lazy loading** for components
- **Error boundaries** for crash prevention

## 🧪 Testing

### API Testing

```bash
# Test job creation
curl -X POST http://localhost:3000/api/create-vacancy \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Job","department":"Engineering","location":"Remote","description":"Test job","recruiterId":"test-recruiter"}'

# Test application submission
curl -X POST http://localhost:3000/api/applications \
  -F "jobId=your-job-id" \
  -F "candidateId=test-candidate" \
  -F "candidateName=Test User" \
  -F "candidateEmail=test@example.com" \
  -F "resume=@/path/to/test.pdf"
```

### Database Testing

```javascript
// Test database connection
import { JobsService } from '../lib/supabaseDatabase'

const testConnection = async () => {
  try {
    const jobs = await JobsService.getAllJobs()
    console.log('Database connection successful:', jobs.length, 'jobs found')
  } catch (error) {
    console.error('Database connection failed:', error.message)
  }
}
```

## 🚀 Deployment

### Environment Variables for Production

```env
# Production Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Production App Configuration
NEXT_PUBLIC_APP_NAME=HireWise
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Migration

```sql
-- Production database setup
-- Run the same SQL commands as in the setup section
-- Ensure all RLS policies are in place
-- Test all functionality in production environment
```

## 🎉 Success Checklist

- [ ] Supabase project created and configured
- [ ] Environment variables set correctly
- [ ] Database tables created with proper schema
- [ ] RLS policies configured and tested
- [ ] Storage buckets created and accessible
- [ ] Authentication working (signup/signin/signout)
- [ ] Job creation and management working
- [ ] Application submission with file upload working
- [ ] AI matching functionality working
- [ ] All API endpoints responding correctly
- [ ] Error handling working properly
- [ ] Performance optimized for production

Your HireWise platform is now fully integrated with Supabase! 🚀 