import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from '../Text';

const EmptyState = ({ message = 'No items found', icon = 'document-outline' }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Icon 
        name={icon} 
        size={64} 
        color={theme.colors.primary} 
        style={styles.icon}
      />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: 200,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmptyState;
