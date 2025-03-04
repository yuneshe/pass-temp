import React from 'react';
import { StyleSheet, View, StatusBar, Platform, SafeAreaView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { AnimatedBackground } from './AnimatedBackground';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const ScreenLayout = ({ children, style }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background + '80' }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      
      <View style={styles.container}>
        <AnimatedBackground />
        
        {Platform.OS === 'android' && (
          <View style={[
            styles.statusBarSpacer, 
            { height: StatusBar.currentHeight }
          ]} />
        )}
        
        <View style={[styles.content, style]}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  statusBarSpacer: {
    width: '100%',
  },
  content: {
    flex: 1,
  },
});
