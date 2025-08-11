import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Upload, Briefcase, Plus, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// Fetcher for react-query to get all open jobs
const fetchOpenJobs = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export default function BulkUploadModal({ isOpen, onClose, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState([]);

  const { data: jobs, isLoading: jobsLoading } = useQuery('openJobs', fetchOpenJobs);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (!selectedJobId || files.length === 0) {
      alert('Please select a job and add at least one resume file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setResults([]);

    const formData = new FormData();
    formData.append('jobId', selectedJobId);
    files.forEach(file => {
      formData.append('resumes', file);
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/bulk-upload-resumes', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        setResults(response.results);
        onSuccess(); // Notify dashboard to refetch data
      } else {
        alert('An error occurred during the upload.');
      }
      setFiles([]);
    };

    xhr.onerror = () => {
      setIsUploading(false);
      alert('Upload failed. Please check the console for details.');
    };

    xhr.send(formData);
  };
  
  const handleClose = () => {
    if (isUploading) return;
    setFiles([]);
    setResults([]);
    setSelectedJobId('');
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-4xl bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Bulk Resume Upload</h1>
                <button onClick={handleClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                    <X />
                </button>
              </div>
              
              <div className="p-6 mb-6 rounded-lg bg-gray-50">
                <label className="flex items-center mb-3 text-lg font-semibold text-gray-700">
                  <Briefcase className="w-6 h-6 mr-2 text-purple-600" />
                  Step 1: Select a Job Posting
                </label>
                <div className="flex gap-4">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    disabled={isUploading || jobsLoading}
                  >
                    <option value="" disabled>
                      {jobsLoading ? 'Loading jobs...' : 'Select a job...'}
                    </option>
                    {jobs?.map(job => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-gray-50">
                <label className="flex items-center mb-3 text-lg font-semibold text-gray-700">
                  <Upload className="w-6 h-6 mr-2 text-purple-600" />
                  Step 2: Upload Resumes
                </label>
                <div {...getRootProps()} className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'}`}>
                  <input {...getInputProps()} />
                  <p className="text-gray-600">Drag & drop resume files here, or click to select files</p>
                </div>
                
                {files.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold">Selected Files ({files.length}):</h4>
                        <ul className="overflow-y-auto list-disc list-inside max-h-32">
                        {files.map((file, i) => <li key={i} className="text-sm text-gray-700">{file.name}</li>)}
                        </ul>
                    </div>
                )}
              </div>

              <div className="mt-6">
                <motion.button
                  onClick={handleUpload}
                  disabled={isUploading || files.length === 0 || !selectedJobId}
                  whileHover={{ scale: 1.02 }}
                  className="w-full py-4 text-lg font-semibold text-white bg-purple-600 rounded-lg shadow-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isUploading ? 'Processing...' : `Process ${files.length} Resumes`}
                </motion.button>
              </div>

              <AnimatePresence>
                {isUploading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-6 bg-gray-100 rounded-lg">
                    <p className="font-semibold">Uploading: {uploadProgress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                      <motion.div 
                        className="bg-purple-600 h-2.5 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </motion.div>
                )}
                {results.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 mt-6 bg-gray-100 rounded-lg">
                    <h3 className="mb-2 text-lg font-bold">Processing Complete</h3>
                    <ul className="overflow-y-auto max-h-40">
                      {results.map((result, i) => (
                        <li key={i} className="flex items-center text-sm">
                          {result.success ? <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> : <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                          {result.fileName} - {result.success ? 'Success' : `Failed: ${result.error}`}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
