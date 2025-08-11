// components/JobVacancyForm.js

import { useState } from 'react';
import { useJobs } from '../contexts/JobContext'; // Import the useJobs hook
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook
import { Upload, FileText, Building, MapPin, Calendar, Users, Briefcase, CheckCircle } from 'lucide-react';

const JobVacancyForm = () => {
  // Use the functions and state from your contexts
  const { createJob, parseJDWithAI, loading: jobLoading } = useJobs();
  const { user } = useAuth(); // Get the currently logged-in user

  const [isParsing, setIsParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    responsibilities: [],
    requirements: [],
    experienceYears: '',
    salary: '',
    jobType: 'Full-time'
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setParsedData(null);

    try {
      const parsedJobData = await parseJDWithAI(file);
      setParsedData(parsedJobData);
      
      setFormData({
        title: parsedJobData.title || '',
        department: parsedJobData.department || '',
        location: parsedJobData.location || '',
        description: parsedJobData.description || '',
        responsibilities: parsedJobData.responsibilities || [],
        requirements: parsedJobData.requirements || [],
        experienceYears: parsedJobData.experience_years || '',
        salary: parsedJobData.salary || '',
        jobType: parsedJobData.job_type || 'Full-time'
      });

    } catch (error) {
      console.error('Error processing JD:', error);
      alert('Error processing job description. Please fill details manually.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResponsibilityChange = (index, value) => {
    const newResponsibilities = [...formData.responsibilities];
    newResponsibilities[index] = value;
    setFormData(prev => ({
      ...prev,
      responsibilities: newResponsibilities
    }));
  };

  const addResponsibility = () => {
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  const removeResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  const handleRequirementChange = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: newRequirements
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
        alert("You must be logged in to create a job.");
        return;
    }
    
    try {
      const result = await createJob({ ...formData, recruiter_id: user.id });

      if (result.success) {
        alert('Job vacancy created successfully!');
        setFormData({
          title: '', department: '', location: '', description: '',
          responsibilities: [], requirements: [], experienceYears: '',
          salary: '', jobType: 'Full-time'
        });
        setParsedData(null);
      } else {
        throw new Error(result.error || 'Failed to create vacancy');
      }
    } catch (error) {
      console.error('Error creating vacancy:', error);
      alert(`Error creating job vacancy: ${error.message}`);
    }
  };

  return (
    <div className="max-w-4xl p-6 mx-auto">
      <div className="p-8 bg-white border border-gray-200 shadow-lg rounded-xl">
        <h2 className="mb-6 text-3xl font-bold text-gray-800">Create Job Vacancy</h2>
        
        <div className="mb-8">
          <div className="p-8 text-center border-2 border-gray-300 border-dashed rounded-lg">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="jd-upload"
            />
            <label htmlFor="jd-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="mb-2 text-lg font-semibold text-gray-700">
                Upload Job Description
              </h3>
              <p className="mb-4 text-gray-500">
                Upload a JD to automatically extract job details using AI
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>PDF, DOC, or DOCX files</span>
              </div>
            </label>
          </div>
          
          {isParsing && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center space-x-2 text-purple-600">
                <div className="w-4 h-4 border-b-2 border-purple-600 rounded-full animate-spin"></div>
                <span>Parsing job description with AI...</span>
              </div>
            </div>
          )}
          
          {parsedData && (
            <div className="p-4 mt-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center space-x-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Job details extracted successfully!</span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Department *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full py-2 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State or Remote"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Experience (Years) *
              </label>
              <input
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Salary Range
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Job Type *
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => handleInputChange('jobType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter detailed job description..."
              required
            />
          </div>

          {/* Responsibilities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Responsibilities *
              </label>
              <button
                type="button"
                onClick={addResponsibility}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add Responsibility
              </button>
            </div>
            <div className="space-y-2">
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleResponsibilityChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter responsibility..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeResponsibility(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Requirements *
              </label>
              <button
                type="button"
                onClick={addRequirement}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                + Add Requirement
              </button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter requirement..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 space-x-4">
            <button
              type="button"
              className="px-6 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobLoading}
              className="px-6 py-2 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {jobLoading ? 'Creating...' : 'Create Vacancy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobVacancyForm;
