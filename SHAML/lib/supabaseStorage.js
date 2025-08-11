import { supabase, STORAGE_BUCKETS } from './supabaseClient';

// Storage service for handling file uploads to Supabase
export class StorageService {

  static async uploadJobDescription(file, fileName, fileType) {
    try {
      const filePath = `public/${Date.now()}-${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.JOB_DESCRIPTIONS)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: fileType
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.JOB_DESCRIPTIONS)
        .getPublicUrl(filePath);

      return {
        success: true,
        path: data.path,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Error uploading job description:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * FIX: The function signature is simplified to prevent argument mismatch.
   * It now correctly accepts the unique filename, the file content as a buffer, and its content type.
   * @param {string} fileName - The unique name for the file in Supabase Storage.
   * @param {Buffer} fileBuffer - The actual content of the file to be uploaded.
   * @param {string} contentType - The MIME type of the file (e.g., 'application/pdf').
   */
  static async uploadResume(fileName, fileBuffer, contentType) {
    try {
      // The path is simplified as the fileName is already unique.
      const filePath = `public/${fileName}`;

      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.RESUMES)
        // The arguments now correctly match: path/filename, then the file buffer.
        .upload(filePath, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType // Use the passed contentType for accuracy
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKETS.RESUMES)
        .getPublicUrl(filePath);

      if (!urlData || !urlData.publicUrl) {
        throw new Error("Could not retrieve public URL for the uploaded resume.");
      }

      return {
        success: true,
        path: data.path,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Error uploading resume:', error);
      return { success: false, error: error.message };
    }
  }
}
