import React from 'react';
import { SafeAreaView, StatusBar, View, StyleSheet, Platform } from 'react-native';

export default function SafeScreen({ children, style }) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
