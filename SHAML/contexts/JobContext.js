// contexts/JobContext.js

import React, { createContext, useContext, useState, useEffect } from 'react'
import { JobsService } from '../lib/supabaseDatabase'

const JobContext = createContext()

export const useJobs = () => {
  const context = useContext(JobContext)
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider')
  }
  return context
}

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchJobs = async (recruiterId = null) => {
    try {
      setLoading(true)
      setError(null)
      
      let fetchedJobs
      if (recruiterId) {
        fetchedJobs = await JobsService.getJobsByRecruiter(recruiterId)
      } else {
        fetchedJobs = await JobsService.getAllJobs()
      }
      
      setJobs(fetchedJobs)
      return fetchedJobs
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const fetchActiveJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const activeJobs = await JobsService.getActiveJobs()
      setJobs(activeJobs)
      return activeJobs
    } catch (error) {
      console.error('Error fetching active jobs:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const createJob = async (jobData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newJob = await JobsService.createJob(jobData)
      
      // Update local state
      setJobs(prevJobs => [newJob, ...prevJobs])
      
      return { success: true, job: newJob }
    } catch (error) {
      console.error('Error creating job:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const updateJob = async (jobId, updates) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedJob = await JobsService.updateJob(jobId, updates)
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? updatedJob : job
        )
      )
      
      return { success: true, job: updatedJob }
    } catch (error) {
      console.error('Error updating job:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const deleteJob = async (jobId) => {
    try {
      setLoading(true)
      setError(null)
      
      await JobsService.deleteJob(jobId)
      
      // Update local state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId))
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting job:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const getJobById = async (jobId) => {
    try {
      setError(null)
      const job = await JobsService.getJobById(jobId)
      return job
    } catch (error) {
      console.error('Error fetching job:', error)
      setError(error.message)
      return null
    }
  }

  const getJobsByRecruiter = async (recruiterId) => {
    try {
      setLoading(true)
      setError(null)
      
      const recruiterJobs = await JobsService.getJobsByRecruiter(recruiterId)
      setJobs(recruiterJobs)
      return recruiterJobs
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error)
      setError(error.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const parseJDWithAI = async (file) => {
    try {
      setLoading(true)
      setError(null)
      
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      // FIX: Add the required 'fileType' field for the backend
      formData.append('fileType', 'jobDescription'); 
      
      // Upload file first
      const uploadResponse = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadResponse.ok) {
        // This is where your error was being thrown
        throw new Error('Failed to upload file')
      }
      
      const uploadResult = await uploadResponse.json()

      // The URL for parsing is in uploadResult.data.url
      const fileUrl = uploadResult.data.url;

      if (!fileUrl) {
        throw new Error("File URL not found in upload response.");
      }
      
      // Parse the uploaded file
      const parseResponse = await fetch('/api/parse-jd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileUrl: fileUrl
        })
      })
      
      if (!parseResponse.ok) {
        throw new Error('Failed to parse JD file')
      }
      
      const parsedData = await parseResponse.json()
      return parsedData
    } catch (error) {
      console.error('Error parsing JD:', error)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = {
    jobs,
    loading,
    error,
    fetchJobs,
    fetchActiveJobs,
    getActiveJobs: fetchActiveJobs, // Alias for compatibility
    createJob,
    updateJob,
    deleteJob,
    getJobById,
    getJobsByRecruiter,
    clearError,
    parseJDWithAI
  }

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  )
}