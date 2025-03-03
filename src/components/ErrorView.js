import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext';
import { getTheme } from '../theme';
import Text from './Text';
import Button from './Button';

const ErrorView = ({ message, onRetry }) => {
  const { isDarkMode } = useSettings();
  const theme = getTheme(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Icon 
        name="alert-circle-outline" 
        size={48} 
        color={theme.colors.error} 
      />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
      {onRetry && (
        <Button
          title="Try Again"
          onPress={onRetry}
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          textStyle={styles.buttonText}
          icon="refresh-outline"
          iconColor="#FFFFFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  button: {
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorView;
