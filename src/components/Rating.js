import React from 'react';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext';
import { getTheme } from '../theme';

const Rating = ({ rating, size = 20, style }) => {
  const { isDarkMode } = useSettings();
  const theme = getTheme(isDarkMode);
  const maxStars = 5;
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={[styles.container, style]}>
      {[...Array(maxStars)].map((_, index) => {
        if (index < fullStars) {
          return (
            <Icon
              key={index}
              name="star"
              size={size}
              color={theme.colors.primary}
              style={styles.star}
            />
          );
        } else if (index === fullStars && hasHalfStar) {
          return (
            <Icon
              key={index}
              name="star-half"
              size={size}
              color={theme.colors.primary}
              style={styles.star}
            />
          );
        } else {
          return (
            <Icon
              key={index}
              name="star-outline"
              size={size}
              color={theme.colors.primary}
              style={styles.star}
            />
          );
        }
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
});

export default Rating;
