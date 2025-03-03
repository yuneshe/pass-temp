import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

const StatCard = ({
  icon,
  value,
  label,
  isCurrency = false,
}) => {
  const { colors } = useTheme();

  const formatValue = () => {
    if (isCurrency) {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Icon
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>
      
      <Text style={styles.value}>
        {formatValue()}
      </Text>
      
      <Text style={[styles.label, { color: colors.text + '80' }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatCard;
