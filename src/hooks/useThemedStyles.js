import { useTheme } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { getTheme } from '../theme';

export const useThemedStyles = (styleCreator) => {
  const { isDarkMode } = useSettings();
  const navigationTheme = useTheme();
  const customTheme = getTheme(isDarkMode);
  
  // If navigation theme is not available, use our custom theme
  const theme = navigationTheme ? {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      ...customTheme.colors,
    },
    fonts: customTheme.fonts,
  } : customTheme;

  return StyleSheet.create(styleCreator(theme));
};
