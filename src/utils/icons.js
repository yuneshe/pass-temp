import { Platform } from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';

// Map of icon names to their platform-specific names
const iconMap = {
  // Navigation icons
  home: 'home-outline',
  materials: 'document-outline',
  downloads: 'download-outline',
  chat: 'chatbubbles-outline',
  profile: 'person-outline',
  settings: 'settings-outline',
  notifications: 'notifications-outline',
  back: Platform.select({ ios: 'chevron-back', android: 'arrow-back' }),
  
  // Action icons
  search: 'search-outline',
  add: 'add-outline',
  close: 'close-outline',
  menu: 'menu-outline',
  more: 'ellipsis-vertical',
  share: 'share-outline',
  
  // File type icons
  folder: 'folder-outline',
  document: 'document-text-outline',
  image: 'image-outline',
  video: 'videocam-outline',
  audio: 'musical-notes-outline',
  pdf: 'document-text-outline',
  
  // UI icons
  chevronForward: Platform.select({ ios: 'chevron-forward', android: 'arrow-forward' }),
  chevronDown: 'chevron-down',
  calendar: 'calendar-outline',
  save: 'save-outline',
  pricetag: 'pricetag-outline',
};

export const getIcon = (name, props = {}) => {
  const iconName = iconMap[name] || name;
  return <Icon name={iconName} {...props} />;
};

export const getIconName = (name) => {
  return iconMap[name] || name;
};

export default {
  getIcon,
  getIconName,
};
