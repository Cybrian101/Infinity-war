import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { useApplications } from '../../contexts/ApplicationContext';
import JobCard from '../../components/JobCard';
import ThemeToggle from '../../components/ThemeToggle';
import { User, Briefcase, FileText, Search, Grid, List, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

export default function CandidateDashboard() {
  // --- CONTEXT HOOKS FOR LIVE DATA ---
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { jobs, fetchActiveJobs, loading: jobsLoading } = useJobs();
  const { applications, fetchApplicationsForCurrentUser, applyToJob, loading: appLoading } = useApplications();
  
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING EFFECT ---
  useEffect(() => {
    if (authLoading) return; // Wait for authentication to resolve

    if (!user) {
      router.push('/candidate/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      await fetchActiveJobs();
      await fetchApplicationsForCurrentUser();
      setIsLoading(false);
    };

    if (user) {
        loadData();
    }
  }, [user, authLoading]);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleApply = async (jobId, resumeFile) => {
    if (!resumeFile) {
        alert("Please select a resume file to apply.");
        return;
    }
    const result = await applyToJob({jobId, resumeFile});
    if (result.success) {
        alert("Successfully applied for the job!");
        fetchApplicationsForCurrentUser(); // Refresh applications to show the new one
    } else {
        alert(`Application failed: ${result.error}`);
    }
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job =>
    job && job.title &&
    (job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (job.skills && job.skills.some(skill => skill && skill.toLowerCase().includes(searchTerm.toLowerCase()))))
  ) : [];
  
  const hasApplied = (jobId) => {
      return applications.some(app => app.job_id === jobId);
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="w-12 h-12 border-b-2 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text">
                HireWise
              </h1>
              <span className="px-3 py-1 ml-4 text-sm text-green-700 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">
                Candidate Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4 mr-2" />
                <span>{profile?.full_name || user?.email}</span>
              </div>
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-gray-600 dark:text-gray-300"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="text-sm">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="container px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3"
        >
          <div className="text-white card bg-gradient-to-r from-green-500 to-emerald-600">
            <div className="flex items-center">
              <Briefcase className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Available Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
            </div>
          </div>
          <div className="text-white card bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="flex items-center">
              <FileText className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Applications Sent</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </div>
          <div className="text-white card bg-gradient-to-r from-purple-500 to-pink-600">
            <div className="flex items-center">
              <User className="w-8 h-8 mr-3" />
              <div>
                <p className="text-sm opacity-90">Profile Complete</p>
                <p className="text-2xl font-bold">{profile ? '100%' : 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <input
              type="text"
              placeholder="Search jobs by title or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-10 pr-4 bg-white border rounded-lg dark:bg-gray-700"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'text-gray-400'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'text-gray-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Available Jobs ({filteredJobs.length})
          </h2>
          <motion.div
            layout
            className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          >
            {jobsLoading || appLoading ? (
                <p className="text-gray-600 dark:text-gray-300">Loading jobs...</p>
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <JobCard 
                    job={job} 
                    onApply={handleApply} 
                    hasApplied={hasApplied(job.id)}
                    isCandidateView={true}
                  />
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center col-span-full">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No jobs found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No jobs are currently available.'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
