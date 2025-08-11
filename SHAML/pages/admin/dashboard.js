import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { useApplications } from '../../contexts/ApplicationContext';
import AnalyticsBoard from '../../components/AnalyticsBoard';
import CanvasJobDisplay from '../../components/CanvasJobDisplay';
import CreateVacancyForm from '../../components/CreateVacancyForm';
import { Shield, BarChart3, Layout, Plus, LogOut, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/router';

export default function AdminDashboard() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { jobs, fetchJobs, loading: jobsLoading } = useJobs();
  const { applications, fetchForAdminOrRecruiter, loading: appLoading } = useApplications();
  
  const router = useRouter();
  
  const [activeView, setActiveView] = useState('analytics');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState(null); // State to hold connection errors

  // --- DATA FETCHING & AUTHENTICATION EFFECT ---
  const loadData = useCallback(async () => {
    if (!user) return;
    setError(null); // Reset error on each new attempt
    try {
      // FIX: Fetch jobs and applications in parallel.
      await Promise.all([
        fetchJobs(),
        fetchForAdminOrRecruiter()
      ]);
    } catch (err) {
      // FIX: Catch the "Failed to fetch" error and set a user-friendly message.
      console.error("Failed to load dashboard data:", err);
      setError("Could not connect to the database. Please verify your Supabase URL and Key in the .env.local file and restart the server.");
    }
  }, [user, fetchJobs, fetchForAdminOrRecruiter]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || profile?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [user, profile, authLoading, router, loadData]);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleJobCreated = () => {
      setShowCreateForm(false);
      fetchJobs();
  };

  const analyticsData = {
    totalJobs: jobs.length,
    totalCandidates: 0,
    totalApplications: applications.length,
    avgMatchScore: applications.length > 0 
      ? Math.round(applications.reduce((sum, app) => sum + (app.match_score || 0), 0) / applications.length)
      : 0,
    jobsByDepartment: jobs.reduce((acc, job) => {
      acc[job.department] = (acc[job.department] || 0) + 1;
      return acc;
    }, {}),
    applicationsByStatus: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {})
  };

  // Combined loading state for a single, clean loading screen
  const isLoading = authLoading || jobsLoading || appLoading;

  // Show loading screen only on initial load and if there's no connection error
  if (isLoading && !jobs.length && !error) { 
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        <div className="w-12 h-12 border-b-2 border-red-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-500 to-pink-600 bg-clip-text">
                HireWise
              </h1>
              <span className="px-3 py-1 ml-4 text-sm text-red-700 bg-red-100 rounded-full">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 mr-2" />
                <span>{profile?.full_name || user?.email}</span>
              </div>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        {/* FIX: Render a prominent error message if the connection fails */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start p-4 mb-6 text-red-800 bg-red-100 border border-red-300 rounded-lg shadow-md"
          >
            <AlertTriangle className="flex-shrink-0 w-6 h-6 mr-3" />
            <div>
              <p className="font-bold">Connection Error</p>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex p-1 space-x-1 bg-white rounded-lg shadow-sm">
            <button
              onClick={() => setActiveView('analytics')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeView === 'analytics' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setActiveView('canvas')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${activeView === 'canvas' ? 'bg-red-100 text-red-700' : 'text-gray-600'}`}
            >
              <Layout className="w-4 h-4 mr-2" />
              Canvas View
            </button>
          </div>
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center bg-red-500 btn-primary hover:bg-red-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Job
          </motion.button>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <CreateVacancyForm
                  onClose={() => setShowCreateForm(false)}
                  onSuccess={handleJobCreated}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeView === 'analytics' ? (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <AnalyticsBoard stats={analyticsData} applications={applications} />
            </motion.div>
          ) : (
            <motion.div
              key="canvas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <CanvasJobDisplay 
                jobs={jobs.filter(j => j.status === 'open')} 
                applications={applications} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
