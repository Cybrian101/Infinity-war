import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { Sparkles, Building, ArrowLeft, Users, FileText, BarChart3, CheckCircle } from 'lucide-react';
import CandidateCard from '../../../components/CandidateCard';
import SendOfferModal from '../../../components/SendOfferModal';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { motion } from 'framer-motion';

// --- New Loading Component with Progress Steps ---
const AnalysisLoadingIndicator = () => {
  const [step, setStep] = useState(1);
  const steps = [
    { id: 1, text: 'Fetching job & application data...', icon: FileText },
    { id: 2, text: 'Reading and analyzing resumes...', icon: BarChart3 },
    { id: 3, text: 'Ranking top candidates with AI...', icon: Sparkles },
  ];

  useEffect(() => {
    // Simulate the progress of the AI analysis for a better UX
    const timers = [
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 3000),
    ];
    return () => timers.forEach(clearTimeout); // Cleanup timers
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white rounded-lg shadow-lg">
        <h2 className="mb-6 text-2xl font-bold text-gray-800">AI Analysis in Progress</h2>
        <div className="space-y-4">
          {steps.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: s.id * 0.2 }}
                className="flex items-center"
              >
                <div className="flex items-center justify-center w-8 h-8 mr-4">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 border-2 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                </div>
                <span className={`text-lg ${isCurrent ? 'font-semibold text-purple-600' : 'text-gray-500'}`}>
                  {s.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


const fetchTopMatches = async (jobId) => {
  if (!jobId) return null;
  
  const response = await fetch('/api/match-candidates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch top matches.');
  }

  const { data: job } = await supabase.from('jobs').select('title, department').eq('id', jobId).single();
  const { topCandidates } = await response.json();
  return { job, topCandidates };
};

export default function TopMatchesPage() {
  const router = useRouter();
  const { jobId } = router.query;

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const { data, error, isLoading } = useQuery(
    ['topMatches', jobId], 
    () => fetchTopMatches(jobId),
    { 
      enabled: !!jobId,
      // Keep data fresh but don't refetch constantly on window focus
      refetchOnWindowFocus: false, 
    }
  );

  const handleSendOffer = (candidate) => {
    setSelectedCandidate(candidate);
    setIsOfferModalOpen(true);
  };

  // Use the new, more descriptive loading component
  if (isLoading) {
    return <AnalysisLoadingIndicator />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link href="/recruiter/dashboard" className="flex items-center text-gray-500 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>
          </div>
          
          <div className="p-6 mb-8 text-center bg-white border border-gray-200 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-800">
              <Sparkles className="inline-block w-8 h-8 mb-2 text-purple-500" /> Top AI Matches
            </h1>
            <p className="text-lg text-gray-600">
              Showing top candidates for: <span className="font-semibold">{data?.job?.title}</span>
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 mt-2 text-sm text-purple-700 bg-purple-100 rounded-full">
                <Building className="w-4 h-4" />
                {data?.job?.department}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {data?.topCandidates?.map((candidate, index) => (
              <CandidateCard 
                key={candidate.id || index} 
                candidate={candidate} 
                index={index}
                onSendOffer={() => handleSendOffer(candidate)}
              />
            ))}
          </div>
          
          {data?.topCandidates?.length === 0 && (
              <div className="py-12 text-center col-span-full">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700">No Candidates Found</h3>
                  <p className="text-gray-500">No applications have been submitted for this job yet.</p>
              </div>
          )}
        </div>
      </main>

      <SendOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        candidate={selectedCandidate}
        jobTitle={data?.job?.title}
      />
    </div>
  );
}
