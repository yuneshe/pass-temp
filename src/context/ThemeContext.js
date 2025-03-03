import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const themes = {
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#FFFFFF',
    textPrimary: '#1A202C',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    primary: '#6366F1',
    secondary: '#EC4899',
    tertiary: '#8B5CF6',
    quaternary: '#14B8A6',
    error: '#EF4444',
    inputBackground: '#F1F5F9',
    cardBackground: '#FFFFFF',
    statusBar: 'dark-content',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#475569',
    primary: '#818CF8',
    secondary: '#F472B6',
    tertiary: '#A78BFA',
    quaternary: '#2DD4BF',
    error: '#F87171',
    inputBackground: '#1E293B',
    cardBackground: '#334155',
    statusBar: 'light-content',
  },
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(themes.light);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        const isDark = JSON.parse(savedTheme);
        setIsDarkMode(isDark);
        setTheme(isDark ? themes.dark : themes.light);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDarkMode = !isDarkMode;
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(newIsDarkMode));
      setIsDarkMode(newIsDarkMode);
      setTheme(newIsDarkMode ? themes.dark : themes.light);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
