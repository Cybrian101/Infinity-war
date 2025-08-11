import { useState } from 'react';
import { motion } from 'framer-motion';
import { useJobs } from '../contexts/JobContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  CheckCircle,
  Loader
} from 'lucide-react';

export default function CreateVacancyForm({ onClose, onSuccess }) {
  // formData state is correct and matches the database schema.
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    description: '',
    responsibilities: [],
    requirements: [],
    experience_years: '',
    salary: '',
    job_type: 'Full-time',
    skills: []
  });
  
  const [jdFile, setJdFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // *** FIX: We will use a local loading state for the submit button ***
  // This gives this component full control and prevents getting stuck.
  const [isCreating, setIsCreating] = useState(false);

  const { createJob, parseJDWithAI } = useJobs();
  const { user } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setJdFile(file);
      handleParseJD(file);
    }
  };

  const handleParseJD = async (file) => {
    setParsing(true);
    setError('');
    try {
      const parsedData = await parseJDWithAI(file);
      setFormData({
        title: parsedData.title || '',
        department: parsedData.department || '',
        location: parsedData.location || '',
        description: parsedData.description || '',
        responsibilities: parsedData.responsibilities || [],
        requirements: parsedData.requirements || [],
        experience_years: parsedData.experience_years || '',
        salary: parsedData.salary || '',
        job_type: parsedData.job_type || 'Full-time',
        skills: parsedData.skills || []
      });
    } catch (error) {
      setError('Failed to parse JD file. Please fill in the details manually.');
    } finally {
      setParsing(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'skills' || name === 'responsibilities' || name === 'requirements') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // *** FIX: The handleSubmit function now manages its own loading state ***
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      alert("You must be logged in to create a job.");
      return;
    }

    // 1. Set local loading state to true
    setIsCreating(true);

    try {
      const jobDataForDB = {
        ...formData,
        recruiter_id: user.id
      };
      
      // 2. Call the createJob function
      await createJob(jobDataForDB);
      
      // 3. If successful, show the success message
      setSuccess(true);
      
      setTimeout(() => {
        onSuccess?.();
        onClose?.();
      }, 2000);
      
    } catch (error) {
      setError('Failed to create job posting. Please try again.');
      console.error(error); // Log the actual error for debugging
    } finally {
      // 4. IMPORTANT: Always set loading back to false, even if there's an error
      setIsCreating(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto text-center card"
      >
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="mb-2 text-2xl font-bold text-gray-800">Job Created!</h2>
        <p className="mb-4 text-gray-600">
          Your job posting has been successfully created.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto card"
    >
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-transparent bg-gradient-to-r from-purple-500 to-indigo-600 bg-clip-text">
          Create New Job Posting
        </h2>
        <p className="text-gray-600">
          Upload a JD file for AI parsing or fill in the details manually.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <div className="p-6 text-center border-2 border-gray-300 border-dashed rounded-lg">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-700">
            Upload Job Description
          </h3>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="jd-upload"
          />
          <label
            htmlFor="jd-upload"
            className="inline-flex items-center cursor-pointer btn-primary"
          >
            {parsing ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Parsing JD...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </>
            )}
          </label>
          {jdFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {jdFile.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
                <label>Job Title</label>
                <input name="title" value={formData.title} onChange={handleChange} className="input-field" required />
            </div>
            <div>
                <label>Department</label>
                <input name="department" value={formData.department} onChange={handleChange} className="input-field" required />
            </div>
              <div>
                <label>Location</label>
                <input name="location" value={formData.location} onChange={handleChange} className="input-field" required />
            </div>
              <div>
                <label>Salary</label>
                <input name="salary" value={formData.salary} onChange={handleChange} className="input-field" />
            </div>
              <div>
                <label>Experience (Years)</label>
                <input name="experience_years" value={formData.experience_years} onChange={handleChange} className="input-field" />
            </div>
              <div>
                <label>Job Type</label>
                <select name="job_type" value={formData.job_type} onChange={handleChange} className="input-field">
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                </select>
            </div>
        </div>
        <div>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows="4" required></textarea>
        </div>
        <div>
            <label>Skills (comma-separated)</label>
            <input name="skills" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''} onChange={handleChange} className="input-field" />
        </div>
        <div>
            <label>Responsibilities (comma-separated)</label>
            <textarea name="responsibilities" value={Array.isArray(formData.responsibilities) ? formData.responsibilities.join(', ') : ''} onChange={handleChange} className="input-field" rows="3"></textarea>
        </div>
        <div>
            <label>Requirements (comma-separated)</label>
            <textarea name="requirements" value={Array.isArray(formData.requirements) ? formData.requirements.join(', ') : ''} onChange={handleChange} className="input-field" rows="3"></textarea>
        </div>

        <div className="flex gap-4">
          {/* *** FIX: The button now uses the local 'isCreating' state *** */}
          <motion.button
            type="submit"
            disabled={isCreating || parsing}
            className={`flex-1 btn-primary ${isCreating || parsing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isCreating ? 'Creating...' : 'Create Job Posting'}
          </motion.button>
          <motion.button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={isCreating || parsing}
          >
            Cancel
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
