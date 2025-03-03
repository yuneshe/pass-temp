import { Platform } from 'react-native';

const fonts = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  light: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
  thin: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }),
};

// Common layout metrics
export const metrics = {
  screenMarginTop: Platform.OS === 'ios' ? 60 : 40,
  contentPadding: 20,
  margin: {
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32,
  },
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    extraLarge: 32,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 12,
    extraLarge: 20,
  },
};

// Theme definitions
export const lightTheme = {
  dark: false,
  colors: {
    primary: '#6803FF',
    background: '#f2f2f7',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#FF3B30',
    placeholder: '#8E8E93',
    secondaryText: '#666666',
    buttonBackground: '#6803FF',
    buttonText: '#ffffff',
    switchTrack: '#3e3e3e',
    switchThumb: '#ffffff',
  },
  fonts,
};

export const darkTheme = {
  dark: true,
  colors: {
    primary: '#6803FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    placeholder: '#8E8E93',
    secondaryText: '#EBEBF5',
    buttonBackground: '#6803FF',
    buttonText: '#FFFFFF',
    switchTrack: '#636366',
    switchThumb: '#FFFFFF',
  },
  fonts,
};

// Default theme object that matches React Navigation's theme structure
const defaultTheme = {
  dark: false,
  colors: {
    primary: '#6803FF',
    background: '#f2f2f7',
    card: '#ffffff',
    text: '#000000',
    border: '#e0e0e0',
    notification: '#FF3B30',
  },
  fonts,
};

export const getTheme = (isDarkMode) => {
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Ensure all required React Navigation theme properties are present
  return {
    ...defaultTheme,
    ...theme,
    colors: {
      ...defaultTheme.colors,
      ...theme.colors,
    },
    fonts: {
      ...defaultTheme.fonts,
      ...theme.fonts,
    },
  };
};
