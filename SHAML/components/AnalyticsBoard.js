import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  Filter,
  Download,
  Sparkles // New icon for AI
} from 'lucide-react';
import { useState } from 'react';

// New AI Summary Component
const AIAnalyticsSummary = ({ stats }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');
    try {
      const response = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate summary.');
      }

      const { summary: aiSummary } = await response.json();
      setSummary(aiSummary);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mt-6 border-t border-gray-200">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center font-semibold text-gray-700 text-md">
          <Sparkles className="w-5 h-5 mr-2 text-purple-500" />
          AI-Powered Hiring Insights
        </h4>
        <motion.button
          onClick={handleGenerateSummary}
          disabled={loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Generate Insights'}
        </motion.button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 mt-4 text-sm text-gray-800 rounded-lg bg-purple-50"
        >
          {summary}
        </motion.div>
      )}
    </div>
  );
};


export default function AnalyticsBoard({ stats, applications = [], filters, onFilterChange }) {
  const {
    totalJobs = 0,
    totalCandidates = 0,
    totalApplications = 0,
    avgMatchScore = 0,
    jobsByDepartment = {},
    applicationsByStatus = {}
  } = stats;

  // Get the 5 most recent applications for the live activity feed
  const recentApplications = applications.slice(0, 5);

  const chartData = [
    { label: 'Engineering', value: jobsByDepartment.Engineering || 0, color: 'from-blue-500 to-cyan-600' },
    { label: 'Design', value: jobsByDepartment.Design || 0, color: 'from-purple-500 to-pink-600' },
    { label: 'Marketing', value: jobsByDepartment.Marketing || 0, color: 'from-green-500 to-emerald-600' },
    { label: 'Sales', value: jobsByDepartment.Sales || 0, color: 'from-orange-500 to-red-600' }
  ];

  const statusData = [
    { label: 'Pending', value: applicationsByStatus.pending || 0, color: 'bg-yellow-500' },
    { label: 'Reviewed', value: applicationsByStatus.reviewed || 0, color: 'bg-blue-500' },
    { label: 'Accepted', value: applicationsByStatus.accepted || 0, color: 'bg-green-500' },
    { label: 'Rejected', value: applicationsByStatus.rejected || 0, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-4"
      >
        <div className="text-white card bg-gradient-to-r from-blue-500 to-cyan-600">
          <div className="flex items-center">
            <Briefcase className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Total Jobs</p>
              <p className="text-2xl font-bold">{totalJobs}</p>
            </div>
          </div>
        </div>
        
        <div className="text-white card bg-gradient-to-r from-purple-500 to-pink-600">
          <div className="flex items-center">
            <Users className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Total Candidates</p>
              <p className="text-2xl font-bold">{totalCandidates}</p>
            </div>
          </div>
        </div>
        
        <div className="text-white card bg-gradient-to-r from-green-500 to-emerald-600">
          <div className="flex items-center">
            <FileText className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Applications</p>
              <p className="text-2xl font-bold">{totalApplications}</p>
            </div>
          </div>
        </div>
        
        <div className="text-white card bg-gradient-to-r from-orange-500 to-red-600">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 mr-3" />
            <div>
              <p className="text-sm opacity-90">Avg Match Score</p>
              <p className="text-2xl font-bold">{avgMatchScore}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Jobs by Department */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2"
        >
          <h3 className="flex items-center mb-4 text-lg font-semibold text-gray-800">
            <BarChart3 className="w-5 h-5 mr-2" />
            Jobs by Department
          </h3>
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <div className="flex items-center">
                  <div className="w-24 h-2 mr-3 bg-gray-200 rounded-full">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                      style={{ 
                        width: `${(item.value / (Math.max(...chartData.map(d => d.value)) || 1)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="w-8 text-sm font-medium text-right text-gray-600">
                    {item.value}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity (Live Data) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card lg:col-span-3"
        >
          <h3 className="mb-4 text-lg font-semibold text-gray-800">
            Recent Applications
          </h3>
          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app, index) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">New Application</p>
                    <p className="text-xs text-gray-600">{app.candidate_name} applied</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent applications found.</p>
            )}
          </div>
          {/* AI Summary Component is now included here */}
          <AIAnalyticsSummary stats={stats} />
        </motion.div>
      </div>
    </div>
  )
} 
