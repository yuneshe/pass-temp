import React from 'react';
import { Text as RNText, StyleSheet } from 'react-native';

const Text = ({ style, children, variant = 'regular', ...props }) => {
  const getStyle = () => {
    switch (variant) {
      case 'link':
        return styles.link;
      case 'heading':
        return styles.heading;
      case 'subheading':
        return styles.subheading;
      case 'caption':
        return styles.caption;
      default:
        return styles.regular;
    }
  };

  return (
    <RNText style={[getStyle(), style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  regular: {
    fontSize: 16,
    color: '#000000',
  },
  link: {
    fontSize: 16,
    color: '#6803FF',
    textDecorationLine: 'underline',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  subheading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  caption: {
    fontSize: 14,
    color: '#666666',
  },
});

export default Text;
