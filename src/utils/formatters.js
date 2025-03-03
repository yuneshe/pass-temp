export const formatPrice = (price) => {
  if (price === 0 || price === 0xaf) return 'Free';
  return `${price.toLocaleString()} XAF`;
};

export const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  return bytes;
};

export const getFileTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    // Specific file types
    case 'pdf':
      return 'document-text';
    case 'doc':
    case 'docx':
      return 'document';
    case 'xls':
    case 'xlsx':
      return 'grid';
    case 'ppt':
    case 'pptx':
      return 'easel';
    
    // General file types
    case 'video':
      return 'videocam';
    case 'audio':
      return 'musical-notes';
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
      return 'image';
    
    default:
      return 'document-outline';
  }
};
