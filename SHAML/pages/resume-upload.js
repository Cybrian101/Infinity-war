import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import FileUpload from '../components/FileUpload';
import { Sparkles } from 'lucide-react';

const ResumeUpload = () => {
  const [jobDescription, setJobDescription] = useState(null);
  const [resumes, setResumes] = useState([]);

  const handleJobDescriptionUpload = (file) => {
    setJobDescription(file);
  };

  const handleResumesUpload = (file) => {
    setResumes([...resumes, file]);
  };

  const handleMatchResumes = () => {
    // Handle matching logic here
    console.log('Matching resumes...');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activePage="resume-upload" />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Title Section */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-purple-600 mb-4">
                HireWise AI
              </h1>
              <p className="text-gray-600 text-lg">
                Upload a Job Description & Resumes, get detailed analysis, and send offers instantly.
              </p>
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUpload
                  title="Job Description (PDF)"
                  fileType="job-description"
                  onFileUpload={handleJobDescriptionUpload}
                  uploadedFile={jobDescription}
                />
                
                <FileUpload
                  title="Resumes (PDFs)"
                  fileType="resumes"
                  onFileUpload={handleResumesUpload}
                  fileCount={resumes.length}
                />
              </div>

              {/* Match Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleMatchResumes}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                >
                  Match Resumes
                </button>
              </div>
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

export default ResumeUpload; 