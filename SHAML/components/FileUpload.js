import { Upload, FileText } from 'lucide-react';
import { useState } from 'react';

const FileUpload = ({ 
  title, 
  fileType, 
  onFileUpload, 
  uploadedFile = null,
  fileCount = 0 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileUpload(files[0]);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center mb-3 space-x-2">
        <FileText className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">{title}</span>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id={`file-upload-${fileType}`}
        />
        <label htmlFor={`file-upload-${fileType}`} className="cursor-pointer">
          <Upload className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          
          {uploadedFile ? (
            <div className="text-sm text-gray-600">
              {fileType === 'job-description' ? (
                uploadedFile.name
              ) : (
                `${fileCount} file(s) selected`
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Drop your {fileType === 'job-description' ? 'job description' : 'resumes'} here or click to browse
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default FileUpload; 