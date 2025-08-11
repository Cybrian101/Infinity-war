import { supabase, TABLES } from './supabaseClient';
// StorageService is imported and now also exported for use in other files.
import { StorageService } from './supabaseStorage'; 

// --- HELPER FUNCTION for error handling ---
const handleSupabaseError = (error, context) => {
  console.error(`Supabase Error in ${context}:`, error);
  throw new Error(error.message || `An error occurred in ${context}.`);
};

// === JOBS SERVICE ===
// Handles all database operations for the 'jobs' table.
export const JobsService = {
  async getAllJobs() {
    const { data, error } = await supabase.from(TABLES.JOBS).select('*').order('created_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getAllJobs');
    return data;
  },

  async getJobsByRecruiter(recruiterId) {
    const { data, error } = await supabase.from(TABLES.JOBS).select('*').eq('recruiter_id', recruiterId).order('created_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getJobsByRecruiter');
    return data;
  },
  
  async getActiveJobs() {
    const { data, error } = await supabase.from(TABLES.JOBS).select('*').eq('status', 'open').order('created_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getActiveJobs');
    return data;
  },

  async getJobById(id) {
    // FIX: Using .maybeSingle() is safer for lookups that might not find a result.
    const { data, error } = await supabase.from(TABLES.JOBS).select('*').eq('id', id).maybeSingle();
    if (error) handleSupabaseError(error, 'getJobById');
    return data;
  },

  async createJob(jobData) {
    const { data, error } = await supabase.from(TABLES.JOBS).insert([jobData]).select().single();
    if (error) handleSupabaseError(error, 'createJob');
    return data;
  },

  async updateJob(id, updates) {
    const { data, error } = await supabase.from(TABLES.JOBS).update(updates).eq('id', id).select().single();
    if (error) handleSupabaseError(error, 'updateJob');
    return data;
  },

  async deleteJob(id) {
    const { error } = await supabase.from(TABLES.JOBS).delete().eq('id', id);
    if (error) handleSupabaseError(error, 'deleteJob');
    return true;
  }
};

// === APPLICATIONS SERVICE ===
// Handles all database operations for the 'applications' table.
export const ApplicationsService = {
  async getAllApplications() {
    const { data, error } = await supabase.from(TABLES.APPLICATIONS).select('*').order('applied_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getAllApplications');
    return data;
  },

  async getApplicationsByJobId(jobId) {
    const { data, error } = await supabase.from(TABLES.APPLICATIONS).select('*').eq('job_id', jobId).order('applied_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getApplicationsByJobId');
    return data;
  },

  async getApplicationsByCandidateId(candidateId) {
    const { data, error } = await supabase.from(TABLES.APPLICATIONS).select('*').eq('candidate_id', candidateId).order('applied_at', { ascending: false });
    if (error) handleSupabaseError(error, 'getApplicationsByCandidateId');
    return data;
  },

  async createApplication(applicationData) {
    const { data, error } = await supabase.from(TABLES.APPLICATIONS).insert([applicationData]).select();
    if (error) handleSupabaseError(error, 'createApplication');
    return data ? data[0] : null;
  },

  async updateApplication(id, updates) {
    const { data, error } = await supabase.from(TABLES.APPLICATIONS).update(updates).eq('id', id).select().single();
    if (error) handleSupabaseError(error, 'updateApplication');
    return data;
  }
};

// === PROFILES SERVICE (Previously CandidatesService) ===
// Handles all database operations for the 'profiles' table.
export const ProfilesService = {
  async getAllProfiles() {
    const { data, error } = await supabase.from(TABLES.PROFILES).select('*');
    if (error) handleSupabaseError(error, 'getAllProfiles');
    return data;
  },

  async getProfileById(id) {
    // FIX: Switched from .single() to .maybeSingle().
    // This prevents the "Cannot coerce" error by returning null if no profile is found,
    // instead of throwing an error that crashes the application flow.
    const { data, error } = await supabase.from(TABLES.PROFILES).select('*').eq('id', id).maybeSingle();
    if (error) handleSupabaseError(error, 'getProfileById');
    return data;
  },
  
  async updateProfile(id, updates) {
    const { data, error } = await supabase.from(TABLES.PROFILES).update(updates).eq('id', id).select().single();
    if (error) handleSupabaseError(error, 'updateProfile');
    return data;
  }
};

// For backward compatibility, you can keep CandidatesService as an alias for ProfilesService
export const CandidatesService = {
  getCandidateById: ProfilesService.getProfileById,
  getAllCandidates: ProfilesService.getAllProfiles,
  updateCandidate: ProfilesService.updateProfile,
};

// Export the StorageService so it can be imported and used in your API routes.
export { StorageService };
