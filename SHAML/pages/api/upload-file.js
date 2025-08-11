import { StorageService } from '../../lib/supabaseStorage'
import formidable from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      keepExtensions: true,
    })

    const [fields, files] = await form.parse(req)
    
    const file = files.file?.[0]
    const fileType = fields.fileType?.[0] // 'jobDescription' or 'resume'
    // These are now only required for resume uploads
    const jobId = fields.jobId?.[0] 
    const candidateId = fields.candidateId?.[0]

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!fileType) {
      return res.status(400).json({ error: 'File type not specified' })
    }

    // Validate file types
    const allowedTypes = ['.pdf', '.doc', '.docx']
    const fileExtension = `.${file.originalFilename?.toLowerCase().split('.').pop()}`
    
    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' 
      })
    }

    // Read file data from the temporary path
    const fileData = fs.readFileSync(file.filepath)
    
    let uploadResult

    if (fileType === 'jobDescription') {
      // FIX: The jobId is NOT required at this stage. 
      // The StorageService function should handle creating a unique path without it.
      uploadResult = await StorageService.uploadJobDescription(fileData, file.originalFilename, file.mimetype)
    } else if (fileType === 'resume') {
      if (!candidateId || !jobId) {
        return res.status(400).json({ error: 'Candidate ID and Job ID required for resume upload' })
      }
      // Pass all necessary info for resume uploads
      uploadResult = await StorageService.uploadResume(fileData, file.originalFilename, file.mimetype, candidateId, jobId)
    } else {
      return res.status(400).json({ error: 'Invalid file type specified' })
    }

    // Clean up the temporary file created by formidable
    fs.unlinkSync(file.filepath)

    if (uploadResult.success) {
      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploadResult // Pass the entire result object back
      })
    } else {
      res.status(500).json({
        success: false,
        error: uploadResult.error?.message || 'An unknown storage error occurred'
      })
    }

  } catch (error) {
    console.error('Upload API Error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process file upload on the server.'
    })
  }
}
