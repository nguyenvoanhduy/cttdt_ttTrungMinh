/**
 * Utility functions for handling Google Drive links
 */

/**
 * Extract file ID from Google Drive link
 * Supports various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID&export=download
 */
export const extractGoogleDriveFileId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  
  // Match patterns for different Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,  // /file/d/FILE_ID
    /[?&]id=([a-zA-Z0-9_-]+)/,       // ?id=FILE_ID or &id=FILE_ID
    /\/d\/([a-zA-Z0-9_-]+)/,         // /d/FILE_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Convert Google Drive link to direct viewable URL
 * @param url - Google Drive share link
 * @returns Direct URL that can be used in <img> src
 */
export const convertGoogleDriveLink = (url: string): string | null => {
  const fileId = extractGoogleDriveFileId(url);
  
  if (!fileId) {
    return null;
  }

  // Use thumbnail API with large size for better quality and reliability
  // sz=w2000 ensures high quality while maintaining compatibility
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
};

/**
 * Validate if the URL is a valid Google Drive link
 */
export const isGoogleDriveLink = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  return url.includes('drive.google.com') || url.includes('docs.google.com');
};

/**
 * Get thumbnail URL for Google Drive file
 */
export const getGoogleDriveThumbnail = (url: string, size: number = 200): string | null => {
  const fileId = extractGoogleDriveFileId(url);
  
  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
};
