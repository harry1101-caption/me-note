import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = 'https://meonote-api.clen.dev/webhook';
const TOKEN_KEY = 'anonymous-token';

// Get anonymous token from localStorage
const getAnonymousToken = (): string => {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    // This shouldn't happen as token is created on first app load
    // But we'll handle it just in case
    token = uuidv4();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
};

export interface UploadResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Upload audio recording to the server
 * @param audioBlob - The recorded audio blob
 * @param filename - Optional custom filename (defaults to timestamp)
 * @returns Upload response
 */
export const uploadRecording = async (
  audioBlob: Blob,
  filename?: string
): Promise<UploadResponse> => {
  try {
    const token = getAnonymousToken();
    
    // Create form data
    const formData = new FormData();
    
    // Generate filename if not provided
    const finalFilename = filename || `recording_${Date.now()}.webm`;
    
    // Append the audio file to form data
    formData.append('file', audioBlob, finalFilename);

    // Make the upload request
    const response = await axios.post(`${API_BASE_URL}/upload-v3`, formData, {
      headers: {
        'anonymous-token': token,
        // Don't set Content-Type - axios will set it automatically with boundary for multipart/form-data
      },
      // Optional: track upload progress
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'Recording uploaded successfully',
    };
  } catch (error) {
    console.error('Error uploading recording:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to upload recording',
      };
    }
    
    return {
      success: false,
      message: 'An unexpected error occurred while uploading',
    };
  }
};

