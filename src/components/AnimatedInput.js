import React, { useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

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
  const focused = useSharedValue(0);
  const filled = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    filled.value = withTiming(value ? 1 : 0);
  }, [value]);

  const containerStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      focused.value,
      [0, 1],
      [1, 1.02]
    );

    return {
      transform: [{ scale }],
      backgroundColor: interpolate(
        focused.value,
        [0, 1],
        ['rgba(242, 242, 247, 1)', 'rgba(242, 242, 247, 0.9)']
      ),
    };
  });

  const handleFocus = () => {
    focused.value = withSpring(1);
  };

  const handleBlur = () => {
    focused.value = withSpring(0);
  };

  return (
    <AnimatedView style={[styles.container, containerStyle, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry && !showPassword}
        placeholderTextColor="#999"
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
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
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
