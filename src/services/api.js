import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // 60 seconds timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    // Enhance error message for better user experience
    if (error.code === 'NETWORK_ERROR') {
      error.userMessage = 'Network error. Please check if the backend server is running.';
    } else if (error.response?.status === 413) {
      error.userMessage = 'File too large. Please select a smaller audio file.';
    } else if (error.response?.status === 415) {
      error.userMessage = 'Unsupported file format. Please use WAV, MP3, WebM, or OGG.';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error. Please try again later.';
    } else {
      error.userMessage = error.response?.data?.error || error.message;
    }
    
    return Promise.reject(error);
  }
);

export const transcriptionAPI = {
  // Upload and transcribe audio file
  uploadAudio: async (audioFile, userId = 'anonymous') => {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);
      formData.append('userId', userId);

      const response = await api.post('/transcribe/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
        },
      });

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error.userMessage || 'Failed to upload and transcribe audio');
    }
  },

  // Get transcription history
  getHistory: async (userId = 'anonymous', limit = 10) => {
    try {
      const response = await api.get('/transcribe/history', {
        params: { userId, limit }
      });

      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      console.error('History fetch error:', error);
      // Don't throw error for history - just return empty array
      return {
        success: false,
        data: [],
        error: error.userMessage || 'Failed to fetch history'
      };
    }
  },

  // Health check
  checkHealth: async () => {
    try {
      const response = await api.get('/transcribe/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: error.userMessage || 'Backend service unavailable'
      };
    }
  }
};

// Audio processing utilities
export const audioUtils = {
  // Convert audio blob to different format if needed
  convertAudioBlob: (blob, targetMimeType = 'audio/wav') => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const newBlob = new Blob([arrayBuffer], { type: targetMimeType });
        resolve(newBlob);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  },

  // Get audio duration
  getAudioDuration: (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => resolve(null);
      audio.src = URL.createObjectURL(file);
    });
  },

  // Validate audio file
  validateAudioFile: (file) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
    const maxSize = 25 * 1024 * 1024; // 25MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please use WAV, MP3, WebM, or OGG format.');
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 25MB.');
    }

    return true;
  }
};

export default api;