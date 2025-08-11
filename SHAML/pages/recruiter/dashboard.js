import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useJobs } from '../../contexts/JobContext';
import { useApplications } from '../../contexts/ApplicationContext';
import JobCard from '../../components/JobCard';
import CreateVacancyForm from '../../components/CreateVacancyForm';
import { 
  Users, 
  Briefcase, 
  Plus, 
  Search,
  LogOut,
  FileText,
  TrendingUp,
  Mail
} from 'lucide-react';
import { useRouter } from 'next/router';
import ThemeToggle from '../../components/ThemeToggle';
import SendOfferModal from '../../components/SendOfferModal';
import JDUploadModal from '../../components/JDUploadModal';
import AnalysisModal from '../../components/AnalysisModal'; // Import the new modal

export default function RecruiterDashboard() {
  // --- CONTEXT HOOKS FOR LIVE DATA ---
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { jobs, fetchJobs, loading: jobLoading } = useJobs();
  const { applications, fetchForAdminOrRecruiter, loading: appLoading } = useApplications();
  
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [currentJobTitle, setCurrentJobTitle] = useState('');
  const [showJDUpload, setShowJDUpload] = useState(null);

  // --- STATE FOR AI ANALYSIS WORKFLOW ---
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [selectedJobForAnalysis, setSelectedJobForAnalysis] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [topCandidates, setTopCandidates] = useState([]);

  // --- DATA FETCHING EFFECT ---
  const loadData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchJobs(), 
      fetchForAdminOrRecruiter()
    ]);
  }, [user, fetchJobs, fetchForAdminOrRecruiter]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || !['recruiter', 'admin'].includes(profile?.role)) {
      router.push('/recruiter/login');
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

  // --- AI ANALYSIS TRIGGER ---
  const handleStartProcessing = async (job) => {
    setSelectedJobForAnalysis(job);
    setAnalysisStep(1); // Start progress bar
    setTopCandidates([]);
    setAnalysisModalOpen(true);

    try {
      // Step 1: JD Compared (simulated for visual feedback)
      await new Promise(res => setTimeout(res, 1000));
      setAnalysisStep(2);

      // Step 2: Profiles Ranked (actual API call to the backend)
      const response = await fetch('/api/match-candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI Matching failed');
      }
      
      const { topCandidates: candidates } = await response.json();
      setTopCandidates(candidates);
      
      await new Promise(res => setTimeout(res, 1000));
      setAnalysisStep(3);
      
      // Step 3: Emails Sent (simulated completion step)
      await new Promise(res => setTimeout(res, 1000));
      setAnalysisStep(4); // Mark as complete

    } catch (error) {
      console.error('Error in AI candidate matching:', error);
      alert('There was an error processing candidates.');
      setAnalysisModalOpen(false); // Close modal on error
    }
  };
  
  const handleSendOffer = (candidate, jobTitle) => {
    setSelectedCandidate(candidate);
    setCurrentJobTitle(jobTitle);
    setShowOfferModal(true);
  };

  const handleOfferSent = async (offerData) => {
    console.log('Sending offer:', offerData);
    // This would contain logic to call the Supabase Edge Function
    return new Promise(resolve => setTimeout(resolve, 1000));
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job =>
    job?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const analytics = {
    totalJobs: jobs.length,
    totalApplications: applications.length,
    avgMatchScore: applications.length > 0
      ? Math.round(applications.reduce((sum, app) => sum + (app.match_score || 0), 0) / applications.length)
      : 0,
  };
  
  const isLoading = authLoading || jobLoading || appLoading;

  if (isLoading && !jobs.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="w-12 h-12 border-b-2 border-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white border-b border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text">
                HireWise
              </h1>
              <span className="px-3 py-1 ml-4 text-sm text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900 dark:text-purple-300">
                Recruiter Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-200">{user?.email}</span>
              <ThemeToggle />
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center text-gray-600 transition-colors dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
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
          className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4"
        >
          {/* Analytics Cards */}
          <div className="flex items-center text-white card bg-gradient-to-r from-purple-500 to-indigo-600">
            <Briefcase className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Active Jobs</p>
              <p className="text-2xl font-bold">{analytics.totalJobs}</p>
            </div>
          </div>
          <div className="flex items-center text-white card bg-gradient-to-r from-blue-500 to-cyan-600">
            <FileText className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Total Applications</p>
              <p className="text-2xl font-bold">{analytics.totalApplications}</p>
            </div>
          </div>
          <div className="flex items-center text-white card bg-gradient-to-r from-green-500 to-emerald-600">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Avg Match Score</p>
              <p className="text-2xl font-bold">{analytics.avgMatchScore}%</p>
            </div>
          </div>
          <div className="flex items-center text-white card bg-gradient-to-r from-orange-500 to-red-600">
            <Mail className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Emails Sent</p>
              <p className="text-2xl font-bold">24</p>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search job postings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700"
            />
          </div>
          <motion.button
            onClick={() => setShowCreateForm(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Job Posting
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

        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-200">
            Job Postings ({filteredJobs.length})
          </h2>
          <motion.div layout className="grid gap-6">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job}
                  index={index}
                  applications={applications.filter(app => app.job_id === job.id)}
                  isProcessing={analysisStep > 0 && analysisStep < 4 && selectedJobForAnalysis?.id === job.id}
                  onStartProcessing={() => handleStartProcessing(job)}
                  onSendOffer={handleSendOffer}
                  onJDUpload={() => setShowJDUpload(job)}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                <h3 className="mb-2 text-xl font-semibold text-gray-600 dark:text-gray-300">
                  No job postings found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Create your first job posting to get started.'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <JDUploadModal
        isOpen={!!showJDUpload}
        onClose={() => setShowJDUpload(null)}
        jobId={showJDUpload?.id}
        jobTitle={showJDUpload?.title}
        onUploadSuccess={() => { /* Can add a success message */ }}
      />

      <AnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        jobTitle={selectedJobForAnalysis?.title}
        analysisStep={analysisStep}
        topCandidates={topCandidates}
        jobId={selectedJobForAnalysis?.id}
      />

      <SendOfferModal
        isOpen={showOfferModal}
        onClose={() => setSelectedCandidate(null)}
        candidate={selectedCandidate}
        jobTitle={currentJobTitle}
        onSendOffer={handleOfferSent}
      />
    </div>
  );
}
