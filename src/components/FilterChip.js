import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

const FilterChip = ({
  label,
  icon,
  selected,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selected ? '#6803FF' : colors.card,
          borderColor: selected ? '#6803FF' : colors.border,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Icon
          name={icon}
          size={16}
          color={selected ? '#fff' : colors.text}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.label,
          {
            color: selected ? '#fff' : colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 80,
    maxWidth: 150,
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 1,
  },
});

export default React.memo(FilterChip);
