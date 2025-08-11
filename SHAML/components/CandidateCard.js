import { motion } from 'framer-motion'
import { Mail, User, Star, Lightbulb, FileText, ExternalLink } from 'lucide-react'

export default function CandidateCard({ candidate, onSendOffer, index }) {
  // Add null check for candidate
  if (!candidate) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">Loading candidate...</p>
      </div>
    );
  }

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400'
    if (score >= 80) return 'text-blue-600 dark:text-blue-400'
    if (score >= 70) return 'text-purple-600 dark:text-purple-400'
    return 'text-orange-600 dark:text-orange-400'
  }

  const getMatchBgColor = (score) => {
    if (score >= 90) return 'bg-green-50 dark:bg-green-900/20'
    if (score >= 80) return 'bg-blue-50 dark:bg-blue-900/20'
    if (score >= 70) return 'bg-purple-50 dark:bg-purple-900/20'
    return 'bg-orange-50 dark:bg-orange-900/20'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
    >
      {/* Header with Name and Match Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {candidate.name || 'Unknown Candidate'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {candidate.role || 'Software Developer'}
            </p>
          </div>
        </div>
        <div className={`text-3xl font-bold ${getMatchColor(candidate.matchScore)}`}>
          {candidate.matchScore || 0}%
        </div>
      </div>

      {/* Experience Quote */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-400 italic text-sm">
          "{candidate.experience || 'No experience description available'}"
        </p>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300 text-sm">
          {candidate.email || 'No email available'}
        </span>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
          <User className="w-3 h-3" />
          {candidate.role || 'Software Developer'}
        </span>
      </div>

      {/* Top Skills */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-purple-600 dark:bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">⚡</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Top Skills
          </h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {(candidate.skills || []).slice(0, 5).map((skill, skillIndex) => (
            <span
              key={skillIndex}
              className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Key Strengths */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Key Strengths
          </h4>
        </div>
        <ul className="space-y-1">
          {(candidate.keyStrengths || []).map((strength, strengthIndex) => (
            <li key={strengthIndex} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {strength}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI Suggestions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-2.5 h-2.5 text-white" />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            AI Suggestions
          </h4>
        </div>
        <ul className="space-y-1">
          {(candidate.aiSuggestions || []).map((suggestion, suggestionIndex) => (
            <li key={suggestionIndex} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {suggestion}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* View Resume Button */}
        {candidate.resumeUrl && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.open(candidate.resumeUrl, '_blank')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Resume
            <ExternalLink className="w-3 h-3" />
          </motion.button>
        )}
        
        {/* Send Offer Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSendOffer(candidate)}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Send Offer Email
        </motion.button>
      </div>
    </motion.div>
  )
}
