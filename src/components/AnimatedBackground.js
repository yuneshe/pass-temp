import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withRepeat, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);
const { width, height } = Dimensions.get('window');
const GRADIENT_SIZE = Math.max(width, height) * 1.2;

export const AnimatedBackground = () => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 15000,
        easing: Easing.linear,
      }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <AnimatedGradient
      colors={[
        'rgba(104, 3, 255, 0.1)',
        'rgba(255, 255, 255, 0.05)',
        'rgba(104, 3, 255, 0.15)',
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, animatedStyle]}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width: GRADIENT_SIZE,
    height: GRADIENT_SIZE,
    top: -GRADIENT_SIZE / 4,
    left: -GRADIENT_SIZE / 4,
    opacity: 1,
  },
});
