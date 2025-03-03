// API Configuration
export const API_BASE_URL = 'http://localhost:8000';
export const API_TIMEOUT = 30000; // 30 seconds

// Storage Configuration
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  THEME: '@theme',
};

// Theme Configuration
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// File Types
export const FILE_TYPES = {
  PDF: 'pdf',
  DOC: 'doc',
  DOCX: 'docx',
  XLS: 'xls',
  XLSX: 'xlsx',
  PPT: 'ppt',
  PPTX: 'pptx',
  ZIP: 'zip',
  RAR: 'rar',
  MP4: 'mp4',
  MP3: 'mp3',
};

// Maximum file size in bytes (100MB)
export const MAX_FILE_SIZE = 100 * 1024 * 1024;
