import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle, 
  AlertCircle,
  Loader
} from 'lucide-react';

export default function ResumeUploadModal({ isOpen, onClose, job, onApply }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setError('');

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please upload a PDF or DOC/DOCX file only.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (selectedFile.size > maxSize) {
        setError('File size must be less than 5MB.');
        return;
      }
      
      setResumeFile(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    noClick: !!resumeFile,
    noKeyboard: true,
  });

  const handleSubmit = async () => {
    if (!resumeFile) {
      setError('Please select a resume file to apply.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // FIX: The onApply function now receives `job.id` and `resumeFile` as separate arguments,
      // which matches what the `handleApplySubmit` function in the dashboard expects.
      const result = await onApply(job.id, resumeFile);

      if (result && result.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          // Reset state after a delay to allow the exit animation to complete.
          setTimeout(() => {
            setSuccess(false);
            setResumeFile(null);
          }, 300);
        }, 2000);
      } else {
        // Use the specific error from the result, or a default message.
        setError(result?.error || 'An unexpected error occurred.');
      }
    } catch (err) {
        console.error("Handle Submit Error:", err);
        setError('A critical error occurred during submission.');
    } finally {
        setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
    setTimeout(() => {
        setResumeFile(null);
        setError('');
        setSuccess(false);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md bg-white rounded-lg shadow-xl dark:bg-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Apply for {job?.title}
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
                  Application Submitted!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your application is now under review.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="p-6">
                  <div {...getRootProps()} className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-green-400'}`}>
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    
                    {resumeFile ? (
                        <div className="flex items-center justify-center">
                            <FileText className="w-5 h-5 mr-2 text-green-500" />
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                {resumeFile.name}
                            </span>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                {isDragActive ? 'Drop your resume here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-500">
                                PDF, DOC, DOCX up to 5MB
                            </p>
                        </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center p-3 mt-4 text-red-600 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400"
                    >
                      <AlertCircle className="w-5 h-5 mr-2" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-3 p-6 border-t rounded-b-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <motion.button
                    onClick={handleClose}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!resumeFile || loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </div>
                    ) : (
                      'Submit Application'
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
