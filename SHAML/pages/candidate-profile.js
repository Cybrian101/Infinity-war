import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Sparkles, BarChart3, Star, Lightbulb, Mail } from 'lucide-react';

const CandidateProfile = () => {
  const candidate = {
    name: 'Jane Doe',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    strengths: ['Team Leadership', 'System Architecture'],
    aiSuggestions: [
      'Explore Kubernetes for orchestration.',
      'Contribute to open-source projects to enhance profile.'
    ]
  };

  const candidate2 = {
    name: 'John Smith',
    skills: ['JavaScript', 'React', 'Redux', 'Next.js', 'GraphQL'],
    strengths: ['UI/UX Design Sense', 'Performance Optimization'],
    aiSuggestions: [
      'Gain experience with backend technologies like Node.js.',
      'Learn a typed superset of JavaScript like TypeScript.'
    ]
  };

  const candidates = [candidate, candidate2];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="candidate-profile" />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Candidate Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates.map((candidate, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  {/* Top Skills */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-700">Top Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Strengths */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-700">Key Strengths</span>
                    </div>
                    <ul className="space-y-2">
                      {candidate.strengths.map((strength, strengthIndex) => (
                        <li key={strengthIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Suggestions */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <Lightbulb className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-700">AI Suggestions</span>
                    </div>
                    <ul className="space-y-2">
                      {candidate.aiSuggestions.map((suggestion, suggestionIndex) => (
                        <li key={suggestionIndex} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Send Offer Button */}
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Send Offer Email</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Floating Action Button */}
        <div className="fixed bottom-6 right-6">
          <button className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-lg shadow-lg transition-colors">
            <div className="flex flex-col items-center space-y-1">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <Sparkles className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile; 