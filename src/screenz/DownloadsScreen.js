import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import * as WebBrowser from 'expo-web-browser';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DOWNLOADS_STORAGE_KEY = '@downloads';

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const getIconForType = (type) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return {
        icon: 'document-text',
        color: '#FF6B6B',
        backgroundColor: '#FFE5B4'
      };
    case 'doc':
    case 'docx':
      return {
        icon: 'document',
        color: '#4ECDC4',
        backgroundColor: '#E0F2F1'
      };
    case 'xls':
    case 'xlsx':
      return {
        icon: 'stats-chart',
        color: '#45B7D1',
        backgroundColor: '#E1F5FE'
      };
    case 'ppt':
    case 'pptx':
      return {
        icon: 'easel',
        color: '#FF8A5B',
        backgroundColor: '#FFF3E0'
      };
    case 'txt':
      return {
        icon: 'text',
        color: '#6A5ACD',
        backgroundColor: '#E6E6FA'
      };
    case 'zip':
    case 'rar':
      return {
        icon: 'archive',
        color: '#8A2BE2',
        backgroundColor: '#F0E6FF'
      };
    case 'mp3':
    case 'wav':
      return {
        icon: 'musical-notes',
        color: '#FF69B4',
        backgroundColor: '#FFF0F5'
      };
    case 'mp4':
    case 'avi':
      return {
        icon: 'film',
        color: '#32CD32',
        backgroundColor: '#F0FFF0'
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return {
        icon: 'image',
        color: '#1E90FF',
        backgroundColor: '#E6F2FF'
      };
    default:
      return {
        icon: 'document',
        color: '#808080',
        backgroundColor: '#F0F0F0'
      };
  }
};

const DownloadCard = ({ item, onPress, onDelete, index }) => {
  const { width } = useWindowDimensions();
  const isTablet = width > 768;
  const { t } = useTranslation();
  
  // Get file extension and corresponding icon details
  const fileExtension = item.file_url.split('.').pop().toLowerCase();
  const { icon, color, backgroundColor } = getIconForType(fileExtension);

  return (
    <TouchableOpacity 
      onPress={onPress}
    >
      <LinearGradient
        colors={['#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          styles.card,
          { 
            borderColor: '#ddd',
            width: isTablet ? (width - 48) / 2 : width - 32,
          }
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: backgroundColor,
            }
          ]}>
            <Icon 
              name={icon} 
              size={24} 
              color={color} 
            />
          </View>
          <View style={styles.titleContainer}>
            <Text 
              style={styles.title} 
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text 
              style={styles.fileName} 
              numberOfLines={1}
            >
              {item.file_url.split('/').pop()}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onDelete}
            style={[
              styles.deleteButton, 
              { backgroundColor: '#FFE5E5' }
            ]}
          >
            <Icon 
              name="trash" 
              size={20} 
              color="#FF6B6B" 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Icon 
              name="time" 
              size={16} 
              color="#666" 
              style={styles.footerIcon} 
            />
            <Text style={styles.footerText}>
              {new Date(item.downloadDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.footerItem}>
            <Icon 
              name="save" 
              size={16} 
              color="#666" 
              style={styles.footerIcon} 
            />
            <Text style={styles.footerText}>
              {item.fileInfo.size ? formatFileSize(item.fileInfo.size) : ''}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function DownloadsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null
  });

  // Memoized filtered downloads to prevent unnecessary re-renders
  const filteredDownloads = useMemo(() => {
    let filtered = downloads;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(download => 
        download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        download.file_url.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter with optimization
    if (dateFilter.startDate && dateFilter.endDate) {
      const start = new Date(dateFilter.startDate);
      const end = new Date(dateFilter.endDate);
      
      // Reset time to start of day for start date and end of day for end date
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter(download => {
        const downloadDate = new Date(download.downloadDate);
        return downloadDate >= start && downloadDate <= end;
      });
    }

    return filtered;
  }, [downloads, searchQuery, dateFilter]);

  // Date filter modal component
  const DateFilterModal = React.memo(({ visible, onClose, onApply }) => {
    const { theme = defaultTheme } = useTheme() || {};
    const { t } = useTranslation();
    const [localStartDate, setLocalStartDate] = useState(null);
    const [localEndDate, setLocalEndDate] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Reset state when modal opens
    useEffect(() => {
      if (visible) {
        setLocalStartDate(null);
        setLocalEndDate(null);
        const today = new Date();
        setSelectedMonth(today.getMonth());
        setSelectedYear(today.getFullYear());
      }
    }, [visible]);

    const generateCalendarDays = useCallback(() => {
      const days = [];
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
      const startingDay = firstDay.getDay();

      // Add empty slots for previous month
      for (let i = 0; i < startingDay; i++) {
        days.push(null);
      }

      // Add actual days
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(selectedYear, selectedMonth, day);
        days.push(currentDate);
      }

      return days;
    }, [selectedMonth, selectedYear]);

    const renderCalendarDays = () => {
      const days = generateCalendarDays();
      return days.map((day, index) => {
        if (!day) return <View key={`empty-${index}`} style={styles.calendarEmptyDay} />;

        const isStartDate = localStartDate && day.toDateString() === localStartDate.toDateString();
        const isEndDate = localEndDate && day.toDateString() === localEndDate.toDateString();
        const isInRange = localStartDate && localEndDate && 
          day > localStartDate && day < localEndDate;

        return (
          <TouchableOpacity 
            key={day.toISOString()}
            style={[
              styles.calendarDay,
              {
                backgroundColor: isStartDate || isEndDate 
                  ? theme.primary + '20' 
                  : isInRange 
                  ? theme.primary + '10' 
                  : 'transparent',
                borderColor: isStartDate || isEndDate ? theme.primary : 'transparent',
              }
            ]}
            onPress={() => {
              if (!localStartDate) {
                setLocalStartDate(day);
              } else if (!localEndDate) {
                // Ensure end date is after start date
                setLocalEndDate(day > localStartDate ? day : localStartDate);
                setLocalStartDate(day > localStartDate ? localStartDate : day);
              } else {
                // Reset selection
                setLocalStartDate(day);
                setLocalEndDate(null);
              }
            }}
          >
            <Text 
              style={[
                styles.calendarDayText,
                {
                  color: isStartDate || isEndDate 
                    ? theme.primary 
                    : isInRange 
                    ? theme.textSecondary 
                    : theme.textPrimary,
                  fontWeight: isStartDate || isEndDate ? 'bold' : 'normal'
                }
              ]}
            >
              {day.getDate()}
            </Text>
          </TouchableOpacity>
        );
      });
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August', 
      'September', 'October', 'November', 'December'
    ];

    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setSelectedMonth(prev => prev > 0 ? prev - 1 : 11)}
                style={styles.navigationButton}
              >
                <Icon 
                  name="chevron-back" 
                  size={24} 
                  color={theme.textPrimary} 
                />
              </TouchableOpacity>
              <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>
                {monthNames[selectedMonth]} {selectedYear}
              </Text>
              <TouchableOpacity 
                onPress={() => setSelectedMonth(prev => prev < 11 ? prev + 1 : 0)}
                style={styles.navigationButton}
              >
                <Icon 
                  name="chevron-forward" 
                  size={24} 
                  color={theme.textPrimary} 
                />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarContainer}>
              <View style={styles.calendarWeekdays}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <Text 
                    key={day} 
                    style={[
                      styles.calendarWeekdayText, 
                      { color: theme.textSecondary }
                    ]}
                  >
                    {day}
                  </Text>
                ))}
              </View>
              <View style={styles.calendarGrid}>
                {renderCalendarDays()}
              </View>
            </View>

            {/* Date Range Display */}
            <View style={styles.dateRangeContainer}>
              <View style={styles.dateRangeItem}>
                <Text style={[styles.dateRangeLabel, { color: theme.textSecondary }]}>
                  {t('downloadsScreen.filters.startDate')}
                </Text>
                <Text style={[styles.dateRangeText, { color: theme.textPrimary }]}>
                  {localStartDate ? localStartDate.toLocaleDateString() : t('downloadsScreen.dates.notSelected')}
                </Text>
              </View>
              <View style={styles.dateRangeItem}>
                <Text style={[styles.dateRangeLabel, { color: theme.textSecondary }]}>
                  {t('downloadsScreen.filters.endDate')}
                </Text>
                <Text style={[styles.dateRangeText, { color: theme.textPrimary }]}>
                  {localEndDate ? localEndDate.toLocaleDateString() : t('downloadsScreen.dates.notSelected')}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity 
                onPress={() => {
                  setLocalStartDate(null);
                  setLocalEndDate(null);
                  setSelectedMonth(new Date().getMonth());
                  setSelectedYear(new Date().getFullYear());
                }}
                style={[
                  styles.clearButton,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.primary
                  }
                ]}
              >
                <Text style={[styles.clearButtonText, { color: theme.textPrimary }]}>
                  {t('downloadsScreen.filters.clear')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  onApply({
                    startDate: localStartDate,
                    endDate: localEndDate
                  });
                  onClose();
                }}
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: theme.primary,
                    opacity: (!localStartDate || !localEndDate) ? 0.5 : 1
                  }
                ]}
                disabled={!localStartDate || !localEndDate}
              >
                <Text 
                  style={[
                    styles.applyButtonText,
                    {
                      color: '#FFF'
                    }
                  ]}
                >
                  {t('downloadsScreen.filters.apply')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  });

  // Fallback theme in case ThemeContext is not available
  const defaultTheme = {
    primary: '#4CAF50',
    background: '#FFFFFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    surfaceVariant: '#F0F0F0',
    onPrimary: '#FFFFFF',
    statusBar: 'dark-content'
  };

  // State for date filter modal
  const [isDateFilterModalVisible, setDateFilterModalVisible] = useState(false);

  // Search and filter header component
  const SearchAndFilterHeader = () => {
    const { t } = useTranslation();
    return (
      <LinearGradient
        colors={['#E6E6FA', '#F0F0FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradientContainer}
      >
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon 
              name="search" 
              size={20} 
              color="#333" 
              style={styles.searchIcon} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder={t('downloadsScreen.search.placeholder')}
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Icon 
                  name="close-circle" 
                  size={20} 
                  color="#333" 
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <TouchableOpacity 
            style={[
              styles.filterButton, 
              { 
                backgroundColor: dateFilter.startDate && dateFilter.endDate 
                  ? 'rgba(0,0,0,0.1)' 
                  : 'transparent' 
              }
            ]}
            onPress={() => setDateFilterModalVisible(true)}
          >
            <Icon 
              name="calendar" 
              size={20} 
              color="#333"
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  };

  // Listen for refresh parameter from other screens
  useEffect(() => {
    if (route.params?.refresh) {
      onRefresh();
      // Clear the refresh parameter to prevent repeated refreshes
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  // Listen for screen focus to refresh
  useEffect(() => {
    onRefresh();
  }, []);

  const detectMimeType = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'mp3': 'audio/mpeg',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      'webm': 'video/webm',
      'txt': 'text/plain'
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  const openDownloadedFile = async (downloadedFile, title) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(downloadedFile);
      if (!fileInfo.exists) {
        Alert.alert(t('downloads.alerts.error'), t('downloads.alerts.fileNotFound'));
        return;
      }

      const fileName = downloadedFile.split('/').pop();
      const mimeType = detectMimeType(fileName);

      console.log('Opening file:', downloadedFile, 'with mime type:', mimeType);

      // Video handling
      const videoMimeTypes = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-matroska',
        'video/webm'
      ];

      if (videoMimeTypes.includes(mimeType)) {
        console.log('Opening video in internal player');
        navigation.navigate('VideoPlayer', {
          uri: downloadedFile,
          title: title || fileName
        });
        return;
      }

      // PDF handling
      if (mimeType === 'application/pdf') {
        try {
          await WebBrowser.openBrowserAsync(`file://${downloadedFile}`);
          return;
        } catch (browserError) {
          console.error('WebBrowser failed:', browserError);
        }
      }

      // Android native handling
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(downloadedFile);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,  // FLAG_GRANT_READ_URI_PERMISSION
            type: mimeType,
          });
          return;
        } catch (intentError) {
          console.error('IntentLauncher failed:', intentError);
        }
      }

      // iOS native handling
      if (Platform.OS === 'ios') {
        try {
          await Sharing.shareAsync(downloadedFile, {
            mimeType,
            dialogTitle: 'Open with',
            UTI: 'public.item'
          });
          return;
        } catch (sharingError) {
          console.error('Sharing failed:', sharingError);
        }
      }

      // Fallback sharing
      await Sharing.shareAsync(downloadedFile, {
        mimeType,
        dialogTitle: 'Open with',
        UTI: 'public.item'
      });

    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert(t('downloads.alerts.error'), t('downloads.alerts.openError'));
    }
  };

  const handleDownloadCardPress = (item) => {
    openDownloadedFile(item.file_path, item.title);
  };

  const loadDownloads = async () => {
    try {
      const storedDownloads = await AsyncStorage.getItem(DOWNLOADS_STORAGE_KEY);
      return storedDownloads ? JSON.parse(storedDownloads) : {};
    } catch (error) {
      console.error('Error loading downloads:', error);
      return {};
    }
  };

  const removeDownload = async (item) => {
    try {
      // Delete the file first
      if (item.file_path) {
        const fileInfo = await FileSystem.getInfoAsync(item.file_path);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(item.file_path);
        }
      }

      // Remove from storage
      const downloads = await loadDownloads();
      delete downloads[item.id];
      await AsyncStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(downloads));
      
      return true;
    } catch (error) {
      console.error('Error removing download:', error);
      return false;
    }
  };

  const fetchDownloads = async () => {
    try {
      const storedDownloads = await loadDownloads();
      
      // Get file info for each download
      const downloadsList = await Promise.all(
        Object.values(storedDownloads).map(async (download) => {
          try {
            const fileInfo = await FileSystem.getInfoAsync(download.file_path);
            return {
              ...download,
              fileInfo: fileInfo.exists ? fileInfo : null
            };
          } catch (error) {
            console.error('Error getting file info:', error);
            return download;
          }
        })
      );

      // Sort by date and filter out downloads with missing files
      const validDownloads = downloadsList
        .filter(download => download.fileInfo)
        .sort((a, b) => new Date(b.downloadDate) - new Date(a.downloadDate));

      setDownloads(validDownloads);
      setError(null);
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError(t('downloadsScreen.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteDownload = async (item) => {
    try {
      const success = await removeDownload(item);
      if (success) {
        fetchDownloads();
        Alert.alert(t('downloadsScreen.success'), t('downloadsScreen.removeSuccess'));
      } else {
        throw new Error('Failed to remove download');
      }
    } catch (error) {
      console.error('Error removing download:', error);
      Alert.alert(t('downloadsScreen.error'), t('downloadsScreen.removeError'));
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDownloads();
  };

  const renderDownloadCard = ({ item, index }) => (
    <DownloadCard 
      item={item} 
      index={index}
      onPress={() => handleDownloadCardPress(item)}
      onDelete={() => handleDeleteDownload(item)}
    />
  );

  return (
    <SafeScreen>
      <StatusBar />
      
      <SearchAndFilterHeader />
      <DateFilterModal 
        visible={isDateFilterModalVisible}
        onClose={() => setDateFilterModalVisible(false)}
        onApply={(newDateFilter) => setDateFilter(newDateFilter)}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : filteredDownloads.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>
            {searchQuery || (dateFilter.startDate && dateFilter.endDate) 
              ? t('downloadsScreen.noResults') 
              : t('downloadsScreen.noDownloads')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDownloads}
          renderItem={renderDownloadCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradientContainer: {
    padding: 16,
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
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileName: {
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 0,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 32,
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContainer: {
    width: '95%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationButton: {
    padding: 8,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  calendarWeekdays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarWeekdayText: {
    fontSize: 12,
    textAlign: 'center',
    width: '14.28%',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 2,
  },
  calendarEmptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDayText: {
    fontSize: 14,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  dateRangeItem: {
    alignItems: 'center',
  },
  dateRangeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F0F0F0',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});
