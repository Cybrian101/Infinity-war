import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Sparkles, User, Building, BarChart3, Star } from 'lucide-react';

const TopMatches = () => {
  const candidates = [
    {
      id: 1,
      name: 'Jane Doe',
      matchScore: 92,
      summary: 'Excellent alignment with core technologies and senior-level experience.',
      email: 'jane.doe@example.com',
      role: 'Senior Software Engineer',
      skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
      strengths: ['Team Leadership']
    },
    {
      id: 2,
      name: 'John Smith',
      matchScore: 85,
      summary: 'Strong frontend skills and experience with modern JavaScript frameworks.',
      email: 'john.smith@example.com',
      role: 'Frontend Developer',
      skills: ['JavaScript', 'React', 'Redux', 'Next.js', 'GraphQL'],
      strengths: ['UI/UX Design Sense', 'Performance Optimization']
    }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="top-matches" />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
              Top Resume Matches
            </h1>

            {/* Candidate Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{candidate.name}</h2>
                    <span className="text-2xl font-bold text-green-600">{candidate.matchScore}</span>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-500 italic mb-4">
                    "{candidate.summary}"
                  </p>

                  {/* Contact & Role */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{candidate.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{candidate.role}</span>
                    </div>
                  </div>

                  {/* Top Skills */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-700">Top Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Strengths */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-700">Key Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {candidate.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
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

export default TopMatches; 