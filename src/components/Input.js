import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function Input({
  style,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  ...props
}) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A202C',
    backgroundColor: '#FFFFFF',
  },
});
