import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

const FilterGroup = ({ title, items = [], selectedItems = [], onSelect, theme }) => {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.groupContainer}>
      <Text style={[styles.groupTitle, { color: theme.colors.textSecondary }]}>
        {title}
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupContent}
      >
        {items.map((item) => {
          const isSelected = selectedItems.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                { 
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onSelect(item.id)}
              activeOpacity={0.7}
            >
              {item.icon && (
                <Icon 
                  name={item.icon} 
                  size={16} 
                  color={isSelected ? '#fff' : theme.colors.text}
                  style={styles.chipIcon}
                />
              )}
              <Text 
                style={[
                  styles.chipText,
                  { color: isSelected ? '#fff' : theme.colors.text }
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const FilterBar = ({ options, selectedFilters, onFilterChange }) => {
  const { colors } = useTheme();

  const handleSelect = (group, itemId) => {
    const currentSelection = selectedFilters[group] || [];
    const newSelection = currentSelection.includes(itemId)
      ? currentSelection.filter(id => id !== itemId)
      : [...currentSelection, itemId];
    
    onFilterChange(group, newSelection);
  };

  const handleReset = () => {
    onFilterChange('sections', []);
    onFilterChange('categories', []);
    onFilterChange('levels', []);
    onFilterChange('subjects', []);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Filters
        </Text>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: colors.border }]}
          onPress={handleReset}
        >
          <Icon name="refresh" size={16} color={colors.primary} />
          <Text style={[styles.resetText, { color: colors.primary }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <FilterGroup
          title="Sections"
          items={options.sections}
          selectedItems={selectedFilters.sections}
          onSelect={(id) => handleSelect('sections', id)}
          theme={{ colors }}
        />
        <FilterGroup
          title="Categories"
          items={options.categories}
          selectedItems={selectedFilters.categories}
          onSelect={(id) => handleSelect('categories', id)}
          theme={{ colors }}
        />
        <FilterGroup
          title="Levels"
          items={options.levels}
          selectedItems={selectedFilters.levels}
          onSelect={(id) => handleSelect('levels', id)}
          theme={{ colors }}
        />
        <FilterGroup
          title="Subjects"
          items={options.subjects}
          selectedItems={selectedFilters.subjects}
          onSelect={(id) => handleSelect('subjects', id)}
          theme={{ colors }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  content: {
    paddingBottom: 8,
  },
  groupContainer: {
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  groupContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FilterBar;
