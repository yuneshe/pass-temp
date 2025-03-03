import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import Text from './Text';
import Icon from 'react-native-vector-icons/Ionicons';

const ANIMATION_DURATION = 300;
const STATUS_BAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight : 0;

export default function MaterialFilters({
  sections = [],
  categories = [],
  levels = [],
  subjects = [],
  filters = {},
  onFilterChange,
  theme,
  visible
}) {
  const slideAnim = useRef(new Animated.Value(visible ? 0 : -400)).current;
  const hasActiveFilters = Object.values(filters).some(value => value !== null);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -400,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleClearAll = () => {
    onFilterChange('section', null);
    onFilterChange('category', null);
    onFilterChange('level', null);
    onFilterChange('subject', null);
  };

  const renderFilterHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Icon name="options-outline" size={20} color={theme.textPrimary} />
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Filters
        </Text>
        {hasActiveFilters && (
          <View style={[styles.filterCount, { backgroundColor: theme.primary }]}>
            <Text style={[styles.filterCountText, { color: theme.onPrimary }]}>
              {Object.values(filters).filter(value => value !== null).length}
            </Text>
          </View>
        )}
      </View>
      {hasActiveFilters && (
        <Pressable
          style={({ pressed }) => [
            styles.clearButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
          onPress={handleClearAll}
        >
          <Icon name="trash-outline" size={16} color={theme.error} />
          <Text style={[styles.clearButtonText, { color: theme.error }]}>
            Clear All
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderChips = (items, type) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {items.map(item => {
            const isSelected = filters[type] === item.id;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.chip,
                  { 
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                    opacity: pressed ? 0.7 : 1,
                  }
                ]}
                onPress={() => onFilterChange(type, isSelected ? null : item.id)}
              >
                <Text style={[
                  styles.chipText,
                  { color: isSelected ? theme.onPrimary : theme.textPrimary }
                ]}>
                  {item.name}
                </Text>
                {isSelected && (
                  <Icon 
                    name="close-circle" 
                    size={16} 
                    color={theme.onPrimary}
                    style={styles.chipIcon} 
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          transform: [{ translateY: slideAnim }],
        }
      ]}
    >
      {renderFilterHeader()}
      <View style={styles.content}>
        {renderChips(sections, 'section')}
        {renderChips(categories, 'category')}
        {renderChips(levels, 'level')}
        {renderChips(subjects, 'subject')}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    paddingTop: STATUS_BAR_HEIGHT + (Platform.OS === 'ios' ? 44 : 56),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  filterCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.7,
  },
  chipsContainer: {
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipIcon: {
    marginLeft: 6,
  },
});
