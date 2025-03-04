import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  StatusBar,
  useWindowDimensions,
  Animated,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { getIcon } from '../utils/icons';
import api from '../config/api';
import { formatFileSize, formatPrice, getFileTypeIcon } from '../utils/formatters';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar';
import SafeScreen from '../components/SafeScreen';
import { AnimatedBackground } from '../components/AnimatedBackground';
import TextComponent from '../components/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../components/ScreenLayout';

const MODES = {
  ALL: 'all',
  FIND: 'find'
};

const HIERARCHY_LEVELS = {
  SECTION: 'section',
  LEVEL: 'level',
  CATEGORY: 'category',
  SUBJECT: 'subject',
  MATERIALS: 'materials'
};

const HierarchyItem = memo(({ item, onPress, theme }) => {
  const colors = {
    text: '#000000',
    textSecondary: '#666666',
    card: '#FFFFFF',
    border: '#E5E5E5',
    primary: '#6803FF',
    success: '#28a745',
    ...theme?.colors
  };

  return (
    <TouchableOpacity
      style={[styles.hierarchyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.hierarchyContent}>
        {getIcon('folder', { size: 24, color: colors.primary, style: styles.hierarchyIcon })}
        <View style={styles.hierarchyTextContainer}>
          <TextComponent style={[styles.hierarchyTitle, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </TextComponent>
          {item.description && (
            <TextComponent style={[styles.hierarchyDescription, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.description}
            </TextComponent>
          )}
        </View>
        {getIcon('chevronForward', { size: 24, color: colors.textSecondary })}
      </View>
    </TouchableOpacity>
  );
});

const MaterialCard = memo(({ item, onPress, theme, index }) => {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = width - 32;
  const colors = {
    text: '#000000',
    textSecondary: '#666666',
    card: '#FFFFFF',
    border: '#E5E5E5',
    primary: '#6803FF',
    success: '#28a745',
    ...theme?.colors
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  // Get file type from the file name or mime type
  const getFileType = () => {
    console.log('Material item:', item);
    
    if (item.file_type) {
      console.log('Using file_type:', item.file_type);
      return item.file_type;
    }
    
    if (item.mime_type) {
      console.log('Using mime_type:', item.mime_type);
      const mimeMap = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'application/vnd.ms-powerpoint': 'ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'video/mp4': 'mp4',
        'audio/mpeg': 'mp3',
      };
      const type = mimeMap[item.mime_type] || 'unknown';
      console.log('Mapped mime_type to:', type);
      return type;
    }
    
    if (item.file_name) {
      console.log('Using file_name:', item.file_name);
      const extension = item.file_name.split('.').pop()?.toLowerCase();
      console.log('Extracted extension:', extension);
      return extension || 'unknown';
    }
    
    console.log('No type information found, using unknown');
    return 'unknown';
  };

  const fileType = getFileType();
  const iconName = getFileTypeIcon(fileType);
  console.log('Final file type:', fileType, 'Icon name:', iconName);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.materialCard, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.fileTypeContainer}>
            {getIcon(iconName, { size: 24, color: colors.primary })}
          </View>
          <View style={styles.headerInfo}>
            <TextComponent style={[styles.materialTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </TextComponent>
            {item.subject && (
              <View style={styles.subjectContainer}>
                <TextComponent
                  style={[styles.subjectText, { color: colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {item.subject.name}
                </TextComponent>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
          <View style={styles.footerInfo}>
            {getIcon('calendar', { size: 14, color: colors.textSecondary, style: styles.footerIcon })}
            <TextComponent style={[styles.footerText, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleDateString()}
            </TextComponent>
          </View>
          <View style={styles.footerInfo}>
            {getIcon('save', { size: 14, color: colors.textSecondary, style: styles.footerIcon })}
            <TextComponent style={[styles.footerText, { color: colors.textSecondary }]}>
              {formatFileSize(item.file_size)}
            </TextComponent>
          </View>
          <View style={styles.footerInfo}>
            {getIcon('pricetag', { size: 14, color: colors.textSecondary, style: styles.footerIcon })}
            <TextComponent 
              style={[
                styles.footerText, 
                { 
                  color: item.price < 1 ? colors.success : colors.primary,
                  fontWeight: '600'
                }
              ]}
            >
              {item.price < 1 ? t('materials.status.free') : formatPrice(item.price)}
            </TextComponent>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

MaterialCard.displayName = 'MaterialCard';

const MaterialsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState(route.params?.mode || MODES.ALL);
  const [currentLevel, setCurrentLevel] = useState(route.params?.startLevel || HIERARCHY_LEVELS.SECTION);
  const [hierarchyData, setHierarchyData] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState([]);
  const [showSearch, setShowSearch] = useState(route.params?.showSearch || false);
  
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { theme } = useTheme();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const flatListRef = useRef(null);
  const { bottom } = useSafeAreaInsets();

  // Default theme colors
  const colors = {
    text: '#000000',
    textSecondary: '#666666',
    card: '#FFFFFF',
    border: '#E5E5E5',
    background: '#FFFFFF',
    primary: '#6803FF',
    success: '#28a745',
    surface: '#FFFFFF',
    ...theme?.colors
  };

  useFocusEffect(
    useCallback(() => {
      const title = mode === MODES.ALL ? t('materials.title') : t('materials.findMaterials');
      navigation.setOptions({
        title,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
        headerLeft: mode === MODES.FIND && currentPath.length > 0 ? () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {getIcon('arrowBack', { size: 24, color: colors.primary })}
          </TouchableOpacity>
        ) : undefined,
        headerRight: () => (
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === MODES.ALL && { backgroundColor: colors.primary },
                { borderColor: colors.primary }
              ]}
              onPress={() => handleModeChange(MODES.ALL)}
              activeOpacity={0.7}
            >
              <TextComponent style={[styles.modeButtonText, { color: mode === MODES.ALL ? colors.surface : colors.primary }]}>
                {t('materials.all')}
              </TextComponent>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === MODES.FIND && { backgroundColor: colors.primary },
                { borderColor: colors.primary }
              ]}
              onPress={() => handleModeChange(MODES.FIND)}
              activeOpacity={0.7}
            >
              <TextComponent style={[styles.modeButtonText, { color: mode === MODES.FIND ? colors.surface : colors.primary }]}>
                {t('materials.find')}
              </TextComponent>
            </TouchableOpacity>
            {mode === MODES.ALL && (
              <TouchableOpacity
                style={[styles.iconButton, showSearch && styles.activeIconButton]}
                onPress={() => setShowSearch(!showSearch)}
                activeOpacity={0.7}
              >
                {getIcon('search', { size: 22, color: showSearch ? colors.surface : colors.primary })}
              </TouchableOpacity>
            )}
          </View>
        ),
      });
    }, [navigation, mode, colors, currentPath, t])
  );

  useEffect(() => {
    if (mode === MODES.FIND) {
      loadHierarchyData();
    }
  }, [currentLevel, currentPath.length]);

  const handleBack = async () => {
    try {
      if (currentPath.length === 0) return;
      
      setLoading(true);
      const newPath = [...currentPath];
      newPath.pop();
      
      let nextLevel;
      switch (currentLevel) {
        case HIERARCHY_LEVELS.MATERIALS:
          nextLevel = HIERARCHY_LEVELS.SUBJECT;
          break;
        case HIERARCHY_LEVELS.SUBJECT:
          nextLevel = HIERARCHY_LEVELS.CATEGORY;
          break;
        case HIERARCHY_LEVELS.CATEGORY:
          nextLevel = HIERARCHY_LEVELS.LEVEL;
          break;
        case HIERARCHY_LEVELS.LEVEL:
          nextLevel = HIERARCHY_LEVELS.SECTION;
          break;
        default:
          nextLevel = HIERARCHY_LEVELS.SECTION;
      }

      setCurrentPath(newPath);
      setCurrentLevel(nextLevel);
    } catch (error) {
      console.error('Error in back navigation:', error);
      Alert.alert('Error', 'Failed to go back. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setCurrentLevel(newMode === MODES.FIND ? HIERARCHY_LEVELS.SECTION : null);
    setCurrentPath([]);
    setMaterials([]);
    setPage(1);
    setSearchQuery('');
    loadContent(newMode);
  };

  const loadContent = async (currentMode = mode) => {
    if (currentMode === MODES.FIND) {
      await loadHierarchyData();
    } else {
      await fetchMaterials(1, true);
    }
  };

  const loadHierarchyData = async () => {
    try {
      setLoading(true);
      let data = [];
      
      console.log('Loading hierarchy data:', {
        currentLevel,
        currentPath,
        pathLength: currentPath.length
      });

      switch (currentLevel) {
        case HIERARCHY_LEVELS.SECTION:
          data = await api.sections.getAll();
          break;
        case HIERARCHY_LEVELS.LEVEL: {
          const sectionPath = currentPath.find(p => p.level === HIERARCHY_LEVELS.SECTION);
          if (!sectionPath) {
            console.warn('Trying to load levels but no section selected');
            setError(t('materials.errors.selectSection'));
            return;
          }
          const sectionId = sectionPath.item?.id;
          if (!sectionId) {
            console.warn('No section ID found for loading levels');
            setError(t('materials.errors.invalidSection'));
            return;
          }
          console.log('Loading levels for section:', sectionId);
          data = await api.levels.getBySection(sectionId);
          break;
        }
        case HIERARCHY_LEVELS.CATEGORY: {
          const levelPath = currentPath.find(p => p.level === HIERARCHY_LEVELS.LEVEL);
          if (!levelPath) {
            console.warn('Trying to load categories but no level selected');
            setError(t('materials.errors.selectLevel'));
            return;
          }
          const levelId = levelPath.item?.id;
          if (!levelId) {
            console.warn('No level ID found for loading categories');
            setError(t('materials.errors.invalidLevel'));
            return;
          }
          data = await api.categories.getByLevel(levelId);
          break;
        }
        case HIERARCHY_LEVELS.SUBJECT: {
          const categoryPath = currentPath.find(p => p.level === HIERARCHY_LEVELS.CATEGORY);
          if (!categoryPath) {
            console.warn('Trying to load subjects but no category selected');
            setError(t('materials.errors.selectCategory'));
            return;
          }
          const categoryId = categoryPath.item?.id;
          if (!categoryId) {
            console.warn('No category ID found for loading subjects');
            setError(t('materials.errors.invalidCategory'));
            return;
          }
          console.log('Loading subjects for category:', categoryId);
          data = await api.subjects.getByCategory(categoryId);
          break;
        }
        case HIERARCHY_LEVELS.MATERIALS: {
          const subjectPath = currentPath.find(p => p.level === HIERARCHY_LEVELS.SUBJECT);
          if (!subjectPath?.item?.id) return;
          data = await api.materials.getBySubject(subjectPath.item.id);
          break;
        }
      }

      if (!mountedRef.current) return;
      setHierarchyData(data || []);
      setError(null);
    } catch (error) {
      console.error('Error loading hierarchy data:', error);
      setError(t('materials.errors.loadFailed'));
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {getIcon('document', { size: 48, color: colors.textSecondary })}
      <TextComponent style={[styles.emptyText, { color: colors.textSecondary }]}>
        {loading ? t('materials.loading') : t('materials.noResults')}
      </TextComponent>
      {error && (
        <>
          <TextComponent style={[styles.errorText, { color: colors.error }]}>
            {error}
          </TextComponent>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => loadContent()}
          >
            <TextComponent style={[styles.retryButtonText, { color: colors.surface }]}>
              {t('materials.tryAgain')}
            </TextComponent>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const handleHierarchyItemPress = async (item) => {
    try {
      setLoading(true);
      console.log('Handling hierarchy item press:', {
        currentLevel,
        item: item.id,
        pathLength: currentPath.length
      });

      const newPath = [...currentPath, { level: currentLevel, item }];
      
      let nextLevel;
      switch (currentLevel) {
        case HIERARCHY_LEVELS.SECTION:
          nextLevel = HIERARCHY_LEVELS.LEVEL;
          break;
        case HIERARCHY_LEVELS.LEVEL:
          nextLevel = HIERARCHY_LEVELS.CATEGORY;
          break;
        case HIERARCHY_LEVELS.CATEGORY:
          nextLevel = HIERARCHY_LEVELS.SUBJECT;
          break;
        case HIERARCHY_LEVELS.SUBJECT:
          nextLevel = HIERARCHY_LEVELS.MATERIALS;
          break;
        default:
          nextLevel = HIERARCHY_LEVELS.SECTION;
      }

      console.log('Updating navigation:', {
        from: currentLevel,
        to: nextLevel,
        newPathLength: newPath.length
      });

      setCurrentPath(newPath);
      setCurrentLevel(nextLevel);

      if (nextLevel === HIERARCHY_LEVELS.MATERIALS) {
        const sectionPath = newPath.find(p => p.level === HIERARCHY_LEVELS.SECTION);
        const levelPath = newPath.find(p => p.level === HIERARCHY_LEVELS.LEVEL);
        const categoryPath = newPath.find(p => p.level === HIERARCHY_LEVELS.CATEGORY);
        const filters = {
          section_id: sectionPath?.item?.id,
          level_id: levelPath?.item?.id,
          category_id: categoryPath?.item?.id,
          subject_id: item.id
        };
        console.log('Fetching materials with filters:', filters);
        await fetchMaterials(1, true, filters);
      }
    } catch (error) {
      console.error('Error in hierarchy navigation:', error);
      Alert.alert('Error', 'Failed to navigate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = useCallback(async (pageNumber = 1, isRefresh = false, filters = {}) => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      const response = await api.materials.getMaterials({
        page: pageNumber,
        search: debouncedSearch,
        per_page: 20,
        ...filters
      });

      if (!mountedRef.current) return;

      if (response?.items) {
        if (isRefresh) {
          setMaterials(response.items);
        } else {
          setMaterials(prev => [...prev, ...response.items]);
        }
        setHasMore(response.hasMore);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading materials:', err);
      if (!mountedRef.current) return;
      setError('Failed to load materials');
      Alert.alert('Error', 'Failed to load materials. Please try again.');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
        loadingRef.current = false;
      }
    }
  }, [debouncedSearch]);

  useEffect(() => {
    loadContent();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (mode === MODES.ALL) {
      setMaterials([]);
      setPage(1);
      fetchMaterials(1, true);
    }
  }, [debouncedSearch, mode]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (mode === MODES.FIND && currentLevel !== HIERARCHY_LEVELS.MATERIALS) {
      loadHierarchyData();
    } else {
      setPage(1);
      fetchMaterials(1, true);
    }
  }, [mode, currentLevel, fetchMaterials]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading || loadingRef.current || mode === MODES.FIND) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMaterials(nextPage);
  }, [hasMore, loading, page, fetchMaterials, mode]);

  const handleMaterialPress = useCallback((material) => {
    navigation.navigate('MaterialDetails', { material });
  }, [navigation]);

  const renderItem = useCallback(({ item, index }) => {
    if (mode === MODES.FIND && currentLevel !== HIERARCHY_LEVELS.MATERIALS) {
      return (
        <HierarchyItem
          item={item}
          onPress={handleHierarchyItemPress}
          theme={theme}
        />
      );
    }
    return (
      <MaterialCard
        item={item}
        index={index}
        onPress={() => handleMaterialPress(item)}
        theme={theme}
      />
    );
  }, [mode, currentLevel, handleHierarchyItemPress, handleMaterialPress, theme]);

  const renderBreadcrumb = () => {
    if (mode !== MODES.FIND || currentPath.length === 0) return null;

    return (
      <View style={styles.breadcrumbContainer}>
        {currentPath.map((path, index) => (
          <React.Fragment key={path.level}>
            <TouchableOpacity
              onPress={() => handleBreadcrumbPress(index)}
              style={styles.breadcrumbItem}
            >
              <TextComponent
                style={[
                  styles.breadcrumbText,
                  { color: colors.primary },
                  index === currentPath.length - 1 && styles.activeBreadcrumb,
                ]}
                numberOfLines={1}
              >
                {t(`materials.hierarchy.${path.level}`)}
              </TextComponent>
            </TouchableOpacity>
            {index < currentPath.length - 1 && (
              <TextComponent style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>
                /
              </TextComponent>
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const handleBreadcrumbPress = (index) => {
    if (index === currentPath.length - 1) return;
    
    setLoading(true);
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    switch (index) {
      case 0:
        setCurrentLevel(HIERARCHY_LEVELS.LEVEL);
        break;
      case 1:
        setCurrentLevel(HIERARCHY_LEVELS.CATEGORY);
        break;
      case 2:
        setCurrentLevel(HIERARCHY_LEVELS.SUBJECT);
        break;
    }
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
          backgroundColor={colors.background}
        />
        
        {showSearch && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            placeholder={t('materials.search.placeholder')}
            style={styles.searchBar}
          />
        )}

        {mode === MODES.FIND && (
          <View style={styles.breadcrumbContainer}>
            {currentPath.map((path, index) => (
              <React.Fragment key={path.level}>
                <TouchableOpacity
                  onPress={() => handleBreadcrumbPress(index)}
                  style={styles.breadcrumbItem}
                >
                  <TextComponent
                    style={[
                      styles.breadcrumbText,
                      { color: colors.primary },
                      index === currentPath.length - 1 && styles.activeBreadcrumb,
                    ]}
                    numberOfLines={1}
                  >
                    {t(`materials.hierarchy.${path.level}`)}
                  </TextComponent>
                </TouchableOpacity>
                {index < currentPath.length - 1 && (
                  <TextComponent style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>
                    /
                  </TextComponent>
                )}
              </React.Fragment>
            ))}
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={mode === MODES.FIND && currentLevel !== HIERARCHY_LEVELS.MATERIALS ? hierarchyData : materials}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.list,
            { 
              paddingTop: Platform.OS === 'android' ? 0 : 8, 
              paddingBottom: Math.max(16, bottom + 80) 
            }
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      </View>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 0 : 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#6803FF',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  list: {
    padding: 16,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  breadcrumbContainer: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  breadcrumbText: {
    fontSize: 14,
  },
  breadcrumbSeparator: {
    marginHorizontal: 4,
  },
  headerButton: {
    marginLeft: 8,
    padding: 8,
  },
  hierarchyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  hierarchyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hierarchyIcon: {
    marginRight: 12,
  },
  hierarchyTextContainer: {
    flex: 1,
  },
  hierarchyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hierarchyDescription: {
    fontSize: 14,
  },
  materialCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileTypeContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hierarchy: {
    fontSize: 14,
    marginBottom: 4,
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectText: {
    fontSize: 14,
    marginLeft: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    fontSize: 14,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#6803FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  activeIconButton: {
    backgroundColor: '#6803FF',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
  },
});

export default MaterialsScreen;
