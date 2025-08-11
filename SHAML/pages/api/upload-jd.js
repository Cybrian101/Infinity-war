import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir: path.join(process.cwd(), 'uploads'),
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    // Ensure uploads directory exists
    if (!fs.existsSync(path.join(process.cwd(), 'uploads'))) {
      fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
    }

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'File upload failed' });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Check if file is PDF
      if (!file.mimetype || !file.mimetype.includes('pdf')) {
        return res.status(400).json({ error: 'Only PDF files are allowed' });
      }

      // Generate unique filename
      const fileName = `jd_${Date.now()}_${file.originalFilename}`;
      const filePath = path.join(process.cwd(), 'uploads', fileName);

      // Move file to uploads directory
      fs.renameSync(file.filepath, filePath);

      // Return file URL for processing
      const fileUrl = `/uploads/${fileName}`;
      
      res.status(200).json({ 
        success: true, 
        fileUrl,
        fileName 
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
} 