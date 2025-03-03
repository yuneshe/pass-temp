import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

const lightTheme = {
  colors: {
    primary: '#6803FF',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    border: '#E2E8F0',
    notification: '#FF3B30',
    secondaryText: '#6B7280',
  },
};

const darkTheme = {
  colors: {
    primary: '#6803FF',
    background: '#1A1A1A',
    card: '#2D2D2D',
    text: '#FFFFFF',
    border: '#404040',
    notification: '#FF453A',
    secondaryText: '#9CA3AF',
  },
};

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [language, setLanguage] = useState('en'); // Default to English

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [themeMode, savedLanguage] = await Promise.all([
        AsyncStorage.getItem('themeMode'),
        AsyncStorage.getItem('language'),
      ]);

      if (themeMode !== null) {
        setIsDarkMode(themeMode === 'dark');
      }

      // Only change language if explicitly set, otherwise keep English
      if (savedLanguage) {
        setLanguage(savedLanguage);
        i18n.changeLanguage(savedLanguage);
      } else {
        // Ensure English is set as default
        setLanguage('en');
        i18n.changeLanguage('en');
        await AsyncStorage.setItem('language', 'en');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage);
      await AsyncStorage.setItem('language', newLanguage);
      i18n.changeLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const value = {
    isDarkMode,
    toggleTheme,
    language,
    changeLanguage,
    theme: isDarkMode ? darkTheme : lightTheme,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
