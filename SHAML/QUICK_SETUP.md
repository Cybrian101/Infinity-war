# 🚀 Quick Setup Guide - Supabase Integration

Your HireWise project is now running with Supabase! Here's what you need to do to complete the setup:

## ✅ What's Already Done

- ✅ Supabase client configured
- ✅ Environment variables set
- ✅ All API endpoints updated for Supabase
- ✅ React contexts updated for Supabase
- ✅ Development server running at `http://localhost:3000`

## 🔧 Next Steps

### 1. Set Up Your Supabase Database

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/wtmqkapqgskwoojwfgcd
2. **Navigate to SQL Editor**
3. **Copy and paste the entire content** from `supabase-schema.sql` file
4. **Run the SQL script**

This will create:
- ✅ Jobs table
- ✅ Candidates table  
- ✅ Applications table
- ✅ Storage buckets for resumes
- ✅ Row Level Security policies
- ✅ Sample data for testing

### 2. Test Your Integration

Visit these URLs to test your application:

- **Homepage**: http://localhost:3000
- **Recruiter Dashboard**: http://localhost:3000/recruiter/dashboard
- **Candidate Dashboard**: http://localhost:3000/candidate/dashboard

### 3. Test Key Features

#### Create a Job
1. Go to Recruiter Dashboard
2. Click "Create Job Posting"
3. Fill in job details
4. Submit and verify job appears in list

#### Apply to a Job
1. Go to Candidate Dashboard
2. Click "Apply Now" on any job
3. Upload a resume (PDF/DOC/DOCX)
4. Submit application

#### Test AI Matching
1. Go to Recruiter Dashboard
2. Find a job with applications
3. Click "Start Processing"
4. Watch AI analysis and view Top 3 candidates

## 🎯 Your Supabase Credentials

```
Project URL: https://wtmqkapqgskwoojwfgcd.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bXFrYXBxZ3Nrd29vandmZ2NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDY4MDEsImV4cCI6MjA3MDA4MjgwMX0.MELlSpt8uHoFTvhTqSPTkFSqwhldbOEFyZ_w-hlBZxU
```

## 📊 Database Schema

Your database will have these tables:

1. **jobs** - Job postings with all details
2. **candidates** - Candidate profiles and information
3. **applications** - Job applications with resume links
4. **Storage buckets** - For resume and job description files

## 🔐 Security Features

- **Row Level Security (RLS)** enabled
- **Public read access** for job listings
- **Authenticated write access** for creating records
- **File upload security** with validation

## 🚨 Troubleshooting

### If you see "Missing Supabase environment variables":
- ✅ Already fixed - environment variables are set

### If database operations fail:
- Run the SQL script in Supabase SQL Editor
- Check that tables exist in your Supabase dashboard

### If file uploads fail:
- Verify storage buckets are created
- Check bucket permissions in Supabase dashboard

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Website loads without errors
- ✅ You can create jobs in Recruiter Dashboard
- ✅ You can apply to jobs in Candidate Dashboard
- ✅ Resume uploads work
- ✅ "Start Processing" shows AI matching results
- ✅ Data persists between page refreshes

## 📞 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Supabase project is active
3. Ensure the SQL script ran successfully
4. Check that storage buckets are created

**Your HireWise platform is now fully integrated with Supabase!** 🚀

Visit http://localhost:3000 to start using your application! 