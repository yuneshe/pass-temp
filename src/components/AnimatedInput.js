import React, { useEffect } from 'react';
import { TextInput, Animated, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const AnimatedInput = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  showPasswordOption,
  onTogglePassword,
  showPassword,
  style,
  ...props
}) => {
  const { theme } = useTheme();
  const focused = new Animated.Value(0);
  const filled = new Animated.Value(value ? 1 : 0);

  useEffect(() => {
    Animated.timing(filled, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const containerStyle = {
    transform: [
      {
        scale: focused.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.02],
        }),
      },
    ],
    backgroundColor: focused.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.surface, theme.surface],
    }),
  };

  const handleFocus = () => {
    focused.setValue(1);
  };

  const handleBlur = () => {
    focused.setValue(0);
  };

  return (
    <Animated.View style={[styles.container, containerStyle, style]}>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            color: theme.textPrimary,
            borderColor: theme.border,
          },
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry && !showPassword}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {showPasswordOption && (
        <TouchableOpacity
          style={styles.showPasswordButton}
          onPress={onTogglePassword}
        >
          <Text style={styles.showPasswordText}>
            {showPassword ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
  },
  showPasswordButton: {
    padding: 8,
  },
  showPasswordText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
