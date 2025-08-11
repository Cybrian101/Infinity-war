import React, { createContext, useContext, useState } from 'react';
import { ApplicationsService, supabase } from '../lib/supabaseDatabase';
import { useAuth } from './AuthContext';
// Import StorageService directly to handle uploads on the client-side
import { StorageService } from '../lib/supabaseStorage';

const ApplicationContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle(); 

        if (error) throw error;
        return data;
    } catch (err) {
        console.error('Error fetching user profile directly:', err.message);
        return null;
    }
  };
  
  /**
   * Fetches applications for the admin and recruiter dashboards.
   * It relies on Supabase's Row-Level Security (RLS) policies to automatically
   * filter which applications are returned based on the user's role.
   */
  const fetchForAdminOrRecruiter = async () => {
    if (!user || !profile || !['admin', 'recruiter'].includes(profile.role)) {
      console.log("Current user is not an admin or recruiter.");
      setApplications([]); // Clear data if the role does not match
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // This single service call is sufficient for both roles.
      // RLS ensures admins see all applications, while recruiters
      // only see applications for jobs they have created.
      const fetchedApplications = await ApplicationsService.getAllApplications();
      setApplications(fetchedApplications || []);
    } catch (error) {
      console.error(`Error fetching applications for ${profile.role}:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchApplicationsForCurrentUser = async () => {
    if (!user) return [];
    try {
      setLoading(true);
      setError(null);
      const fetchedApplications = await ApplicationsService.getApplicationsByCandidateId(user.id);
      setApplications(fetchedApplications);
      return fetchedApplications;
    } catch (error) {
      console.error('Error fetching current user applications:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const applyToJob = async (applicationData) => {
    if (!user) {
      return { success: false, error: "User not authenticated. Please log in again." };
    }

    setLoading(true);
    setError(null);

    try {
      const { jobId, resumeFile } = applicationData;

      if (!resumeFile) {
        throw new Error("A resume file is required to apply.");
      }

      // 1. Upload the resume directly using the client-side StorageService
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${user.id}_${jobId}_${Date.now()}.${fileExt}`;
      
      const uploadResult = await StorageService.uploadResume(fileName, resumeFile, resumeFile.type);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Failed to upload resume.");
      }

      // 2. Prepare the application data for the database
      const newApplicationData = {
        job_id: jobId,
        candidate_id: user.id, // This now correctly uses the authenticated user's ID
        candidate_name: profile?.full_name || user.email,
        candidate_email: user.email,
        resume_url: uploadResult.url,
        status: 'Applied',
      };

      // 3. Create the application record directly using the client-side ApplicationsService
      const newApplication = await ApplicationsService.createApplication(newApplicationData);

      if (!newApplication) {
        throw new Error("Failed to save the application to the database.");
      }

      // 4. Update the local state for an immediate UI update
      setApplications(prev => [newApplication, ...prev]);
      return { success: true, application: newApplication };

    } catch (error) {
      console.error('Error applying to job:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (applicationId, updates) => {
    try {
      setLoading(true);
      setError(null);
      const updatedApplication = await ApplicationsService.updateApplication(applicationId, updates);
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? updatedApplication : app)
      );
      return { success: true, application: updatedApplication };
    } catch (error) {
      console.error('Error updating application:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const getProfileById = async (profileId) => {
    try {
      setError(null);
      const profileData = await fetchUserProfile(profileId);
      return profileData;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
      return null;
    }
  };

  const value = {
    applications,
    loading,
    error,
    fetchForAdminOrRecruiter, // New function for dashboards
    fetchApplicationsForCurrentUser, // For the candidate dashboard
    applyToJob,
    updateApplication,
    getProfileById,
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};
