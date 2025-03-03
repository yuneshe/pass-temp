import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { fetchFilterOptions } from '../services/api';

const FilterOption = ({ label, selected, onPress, theme, delay = 0 }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[animatedStyle, styles.optionContainer]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.option,
          {
            backgroundColor: selected ? theme.primary : theme.surfaceVariant,
            borderColor: selected ? theme.primary : theme.border,
          }
        ]}
      >
        <Text 
          style={[
            styles.optionLabel,
            { color: selected ? '#FFF' : theme.textPrimary }
          ]}
        >
          {label}
        </Text>
        {selected && (
          <Icon 
            name="checkmark-circle" 
            size={20} 
            color="#FFF"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const FilterSection = ({ title, options, selectedOptions, onOptionPress, theme, startDelay = 0 }) => (
  <View style={styles.section}>
    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
      {title}
    </Text>
    <View style={styles.optionsGrid}>
      {options.map((option, index) => (
        <FilterOption
          key={option.id}
          label={option.name}
          selected={selectedOptions.includes(option.id)}
          onPress={() => onOptionPress(option.id)}
          theme={theme}
          delay={startDelay + (index * 50)}
        />
      ))}
    </View>
  </View>
);

export default function FilterScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    sections: [],
    categories: [],
    levels: [],
    subjects: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    sections: [],
    categories: [],
    levels: [],
    subjects: [],
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const options = await fetchFilterOptions();
      setFilterOptions(options);
      setError(null);
    } catch (err) {
      setError('Failed to load filter options');
      console.error('Error loading filter options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionPress = (type, id) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(id)
        ? prev[type].filter(item => item !== id)
        : [...prev[type], id]
    }));
  };

  const handleClearAll = () => {
    setSelectedFilters({
      sections: [],
      categories: [],
      levels: [],
      subjects: [],
    });
  };

  const hasSelectedFilters = Object.values(selectedFilters).some(arr => arr.length > 0);

  const handleApply = () => {
    // Pass selected filters back to MaterialsScreen
    navigation.navigate('Materials', { filters: selectedFilters });
  };

  return (
    <SafeScreen>
      <StatusBar 
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary + '20', theme.background]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={[styles.headerButton, { backgroundColor: theme.surfaceVariant }]}
              >
                <Icon name="arrow-back" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
              <View style={styles.headerTitles}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                  Filter
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {hasSelectedFilters 
                    ? `${Object.values(selectedFilters).flat().length} selected`
                    : 'Select filters'}
                </Text>
              </View>
            </View>
            {hasSelectedFilters && (
              <TouchableOpacity
                onPress={handleClearAll}
                style={[styles.clearButton, { backgroundColor: theme.surfaceVariant }]}
              >
                <Text style={[styles.clearButtonText, { color: theme.textPrimary }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Icon 
              name="alert-circle-outline" 
              size={64} 
              color={theme.error} 
              style={styles.errorIcon}
            />
            <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={loadFilterOptions}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <FilterSection
                title="Sections"
                options={filterOptions.sections}
                selectedOptions={selectedFilters.sections}
                onOptionPress={(id) => handleOptionPress('sections', id)}
                theme={theme}
                startDelay={0}
              />
              <FilterSection
                title="Categories"
                options={filterOptions.categories}
                selectedOptions={selectedFilters.categories}
                onOptionPress={(id) => handleOptionPress('categories', id)}
                theme={theme}
                startDelay={200}
              />
              <FilterSection
                title="Levels"
                options={filterOptions.levels}
                selectedOptions={selectedFilters.levels}
                onOptionPress={(id) => handleOptionPress('levels', id)}
                theme={theme}
                startDelay={400}
              />
              <FilterSection
                title="Subjects"
                options={filterOptions.subjects}
                selectedOptions={selectedFilters.subjects}
                onOptionPress={(id) => handleOptionPress('subjects', id)}
                theme={theme}
                startDelay={600}
              />
            </ScrollView>

            <LinearGradient
              colors={['transparent', theme.background]}
              style={styles.footer}
            >
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  { 
                    backgroundColor: hasSelectedFilters ? theme.primary : theme.surfaceVariant,
                    opacity: hasSelectedFilters ? 1 : 0.5,
                  }
                ]}
                onPress={handleApply}
                disabled={!hasSelectedFilters}
              >
                <Text style={[
                  styles.applyButtonText,
                  { color: hasSelectedFilters ? '#FFF' : theme.textSecondary }
                ]}>
                  Apply Filters
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </>
        )}
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    opacity: 0.8,
  },
  clearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  optionContainer: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    paddingTop: 40,
  },
  applyButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 16,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    marginHorizontal: 32,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
