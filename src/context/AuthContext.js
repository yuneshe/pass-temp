import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken, clearAuthToken } from '../config/api';
import { CommonActions, useNavigation } from '@react-navigation/native';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStoredToken();
  }, []); 

  useEffect(() => {
    if (!isLoading) {
      if (userToken) {
        console.log('Token present, navigating to Main');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          })
        );
      } else {
        console.log('No token, navigating to Welcome');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          })
        );
      }
    }
  }, [userToken, isLoading, navigation]);

  const loadStoredToken = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@auth_token');
      console.log('Loading stored token:', token);
      
      if (token) {
        await setAuthToken(token);
        setUserToken(token);
        const userData = await api.auth.getUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored token:', error);
      await AsyncStorage.removeItem('@auth_token');
      setUserToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email });
      const response = await api.auth.login({ 
        email: email.trim().toLowerCase(),
        password 
      });
      console.log('Login response:', response);
      
      if (response.token) {
        await AsyncStorage.setItem('@auth_token', response.token);
        await setAuthToken(response.token);
        setUserToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('No token received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await api.auth.logout().catch(console.error);
      await AsyncStorage.removeItem('@auth_token');
      await clearAuthToken();
      setUserToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isLoading,
    isAuthenticated: !!userToken,
    userToken,
    user,
    error,
    signIn,
    signOut,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
