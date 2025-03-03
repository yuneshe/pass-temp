import React, { useEffect, useState } from 'react';
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider } from './src/context/SettingsContext';
import { LanguageProvider } from './src/context/LanguageContext';
import { View, ActivityIndicator, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { initializeApiConfig } from './src/config/api';

// Auth Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import MaterialsScreen from './src/screens/MaterialsScreen';
import MaterialDetailsScreen from './src/screens/MaterialDetailsScreen';
import ImageViewerScreen from './src/screens/ImageViewerScreen';
import DownloadsScreen from './src/screens/DownloadsScreen';
import ChatScreen from './src/screens/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Import the pre-configured Navigator
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupApi = async () => {
      try {
        await initializeApiConfig();
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    setupApi();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 }}>
        <Text style={{ color: '#FF3B30', fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <AuthProvider>
          <ThemeProvider>
            <SettingsProvider>
              <LanguageProvider>
                <AppNavigator />
              </LanguageProvider>
            </SettingsProvider>
          </ThemeProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
