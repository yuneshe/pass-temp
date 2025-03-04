import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AnimatedBackground = () => {
  const { theme } = useTheme();
  const circles = useRef([...Array(6)].map(() => ({
    scale: new Animated.Value(0.1),
    position: new Animated.ValueXY({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
    }),
    opacity: new Animated.Value(0),
  }))).current;

  const animateCircle = (circle, index) => {
    const duration = 12000 + (index * 2000);
    
    circle.position.setValue({
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
    });

    const animation = Animated.parallel([
      Animated.sequence([
        Animated.timing(circle.opacity, {
          toValue: 0.12,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.timing(circle.opacity, {
          toValue: 0.08,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(circle.position, {
        toValue: {
          x: Math.random() * SCREEN_WIDTH,
          y: Math.random() * SCREEN_HEIGHT,
        },
        duration: duration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(circle.scale, {
          toValue: 0.8 + Math.random() * 0.4,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
        Animated.timing(circle.scale, {
          toValue: 0.1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animation.start(() => {
      animateCircle(circle, index);
    });

    return animation;
  };

  useEffect(() => {
    const activeAnimations = circles.map((circle, index) => {
      return Animated.delay(index * 1000).start(() => {
        animateCircle(circle, index);
      });
    });

    return () => {
      activeAnimations.forEach(animation => {
        if (animation && animation.stop) {
          animation.stop();
        }
      });
    };
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {circles.map((circle, index) => {
        const size = 200 + (index * 50);
        const color = theme.primary;

        return (
          <Animated.View
            key={index}
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                opacity: circle.opacity,
                transform: [
                  { translateX: circle.position.x },
                  { translateY: circle.position.y },
                  { scale: circle.scale },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
  },
});
