const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface UploadResponse {
  success: boolean;
  url?: string;
  imageUrl?: string; // Legacy support
  publicId?: string;
  filename?: string;
  message?: string;
  error?: string;
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken') || localStorage.getItem('authToken');
};

/**
 * Upload an image file to Cloudinary
 */
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errorData: UploadResponse = await response.json().catch(() => ({
      success: false,
      message: `HTTP ${response.status}`
    }));
    throw new Error(errorData.message || 'Failed to upload image');
  }

  const result: UploadResponse = await response.json();
  return result.url || result.imageUrl || '';
};

/**
 * Upload an audio file to Cloudinary
 */
export const uploadAudio = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/audio`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errorData: UploadResponse = await response.json().catch(() => ({
      success: false,
      message: `HTTP ${response.status}`
    }));
    throw new Error(errorData.message || 'Failed to upload audio');
  }

  const result: UploadResponse = await response.json();
  return result.url || '';
};

/**
 * Upload a video file to Cloudinary
 */
export const uploadVideo = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errorData: UploadResponse = await response.json().catch(() => ({
      success: false,
      message: `HTTP ${response.status}`
    }));
    throw new Error(errorData.message || 'Failed to upload video');
  }

  const result: UploadResponse = await response.json();
  return result.url || '';
};

/**
 * Upload a document file to Cloudinary
 */
export const uploadDocument = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/document`, {
    method: 'POST',
    headers,
    body: formData
  });

  if (!response.ok) {
    const errorData: UploadResponse = await response.json().catch(() => ({
      success: false,
      message: `HTTP ${response.status}`
    }));
    throw new Error(errorData.message || 'Failed to upload document');
  }

  const result: UploadResponse = await response.json();
  return result.url || '';
};

/**
 * Generic upload function with auto-detection
 */
export const uploadFile = async (file: File): Promise<string> => {
  if (file.type.startsWith('image/')) {
    return uploadImage(file);
  } else if (file.type.startsWith('audio/')) {
    return uploadAudio(file);
  } else if (file.type.startsWith('video/')) {
    return uploadVideo(file);
  } else if (file.type === 'application/pdf' || file.type.includes('document')) {
    return uploadDocument(file);
  } else {
    // Fallback to image endpoint
    return uploadImage(file);
  }
};
