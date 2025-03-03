import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Image,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { 
  FadeInDown, 
  FadeInRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import api from '../config/api';
import { AnimatedBackground } from '../components/AnimatedBackground';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FeatureCard = ({ title, icon, gradient, onPress, delay }) => {
  const scale = useSharedValue(1);
  const { theme } = useTheme();
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      entering={FadeInDown.delay(delay).springify()}
      style={[animatedStyle, styles.cardWrapper]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { borderColor: theme.border }]}
      >
        <View style={styles.cardIconContainer}>
          <Icon name={icon} size={28} color="#FFF" />
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {title}
        </Text>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const RecentActivityCard = ({ item, onPress, delay }) => {
  const scale = useSharedValue(1);
  const { theme } = useTheme();
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getActivityIcon = () => {
    switch (item.type) {
      case 'download':
        return 'download-outline';
      case 'view':
        return 'eye-outline';
      case 'bookmark':
        return 'bookmark-outline';
      default:
        return 'document-outline';
    }
  };

  return (
    <AnimatedTouchable
      entering={FadeInRight.delay(delay).springify()}
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <LinearGradient
        colors={[theme.surfaceVariant, theme.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.recentCard, { borderColor: theme.border }]}
      >
        <View style={[styles.activityIconContainer, { backgroundColor: theme.primary }]}>
          <Icon name={getActivityIcon()} size={20} color="#FFF" />
        </View>
        <View style={styles.recentCardContent}>
          <Text 
            style={[styles.recentCardTitle, { color: theme.textPrimary }]} 
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={[styles.recentCardTime, { color: theme.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
        </View>
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const MaterialCard = ({ item, onPress, delay }) => {
  const scale = useSharedValue(1);
  const { theme } = useTheme();
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getFileIcon = (fileType) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return 'document-outline';
      case 'doc':
      case 'docx':
        return 'document-text-outline';
      case 'xls':
      case 'xlsx':
        return 'grid-outline';
      case 'ppt':
      case 'pptx':
        return 'easel-outline';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image-outline';
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'videocam-outline';
      default:
        return 'document-outline';
    }
  };

  const fileType = item.file_url?.split('.').pop();
  const fileIcon = getFileIcon(fileType);

  return (
    <AnimatedTouchable
      entering={FadeInRight.delay(delay).springify()}
      style={[animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <LinearGradient
        colors={[theme.surfaceVariant, theme.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.recentCard, { borderColor: theme.border }]}
      >
        <View style={styles.recentCardContent}>
          <Text 
            style={[styles.recentCardTitle, { color: theme.textPrimary }]} 
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text style={[styles.recentCardTime, { color: theme.textSecondary }]}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
          <View style={styles.metadataContainer}>
            {item.subject?.name && (
              <View style={styles.metadataItem}>
                <Icon name="book-outline" size={14} color={theme.textSecondary} />
                <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
                  {item.subject.name}
                </Text>
              </View>
            )}
            <View style={styles.metadataItem}>
              <Icon name={fileIcon} size={14} color={theme.textSecondary} />
              <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
                {fileType?.toUpperCase() || 'FILE'}
              </Text>
            </View>
          </View>
        </View>
        
        {item.thumbnail_url ? (
          <Image 
            source={{ uri: item.thumbnail_url }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.thumbnailPlaceholder, { backgroundColor: theme.primary }]}>
            <Icon name={fileIcon} size={24} color="#FFF" />
          </View>
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const CARD_WIDTH = width > 500 ? width * 0.3 : width * 0.42;
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  const features = [
    { 
      title: t('home.features.browseMaterials'),
      icon: 'library-outline',
      gradient: ['#6366F1', '#818CF8'],
      onPress: () => navigation.navigate('Materials', { mode: 'find' })
    },
    { 
      title: t('home.features.myDownloads'),
      icon: 'download-outline',
      gradient: ['#EC4899', '#F472B6'],
      onPress: () => navigation.navigate('Downloads')
    },
    { 
      title: t('home.features.searchMaterials'),
      icon: 'search-outline',
      gradient: ['#8B5CF6', '#A78BFA'],
      onPress: () => navigation.navigate('Materials', { mode: 'all', showSearch: true })
    },
    { 
      title: t('home.features.myProfile'),
      icon: 'person-outline',
      gradient: ['#14B8A6', '#2DD4BF'],
      onPress: () => navigation.navigate('Profile')
    },
  ];

  const loadRecentMaterials = async () => {
    try {
      setLoading(true);
      const response = await api.materials.getMaterials({
        sortBy: 'newest',
        limit: 5
      });
      
      if (response && response.items) {
        setRecentMaterials(response.items);
      }
    } catch (error) {
      console.error('Error loading recent materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.notifications.getUnread();
      setNotificationCount(response?.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    loadRecentMaterials();
    fetchNotifications();
  }, []);

  return (
    <SafeScreen style={styles.container}>
      <StatusBar 
        barStyle="light-content"
        backgroundColor="#6803FF"
      />
      <AnimatedBackground />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: 56 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.primary + '20', theme.background]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <Text style={[styles.greeting, { color: theme.textPrimary }]}>
                {t('home.welcome')}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                {t('home.subtitle')}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <LottieView
                source={require('../assets/animations/education.json')}
                autoPlay
                loop
                style={styles.headerAnimation}
              />
              <TouchableOpacity 
                style={[styles.notificationButton, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="notifications-outline" size={24} color={theme.textPrimary} />
                {notificationCount > 0 && (
                  <View style={[styles.notificationBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={[styles.section, styles.featuresSection]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('home.quickAccess')}
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={index * 100}
                style={{ width: CARD_WIDTH }}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {t('home.recentMaterials')}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Materials')}
              style={styles.seeAllButton}
            >
              <Text style={[styles.seeAllText, { color: theme.primary }]}>
                {t('home.seeAll')}
              </Text>
              <Icon name="chevron-forward" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                {t('home.loading')}
              </Text>
            </View>
          ) : recentMaterials.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('home.noMaterials')}
              </Text>
            </View>
          ) : (
            <View style={styles.recentList}>
              {recentMaterials.map((item, index) => (
                <MaterialCard
                  key={item.id}
                  item={item}
                  delay={index * 100}
                  onPress={() => navigation.navigate('MaterialDetails', { material: item })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAnimation: {
    width: 80,
    height: 80,
    marginRight: 12,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  featuresSection: {
    marginTop: -20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  seeAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  recentList: {
    marginTop: 8,
  },
  recentCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentCardContent: {
    flex: 1,
    marginRight: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recentCardContent: {
    flex: 1,
  },
  recentCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  recentCardTime: {
    fontSize: 13,
  },
  recentCardSubject: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    padding: 2,
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    fontSize: 12,
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
});
