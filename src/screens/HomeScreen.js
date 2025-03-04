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
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Text from '../components/Text';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import api from '../config/api';
import { ScreenLayout } from '../components/ScreenLayout';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FeatureCard = ({ title, icon, gradient, onPress, delay }) => {
  const { theme } = useTheme();
  const scale = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }]
  };

  return (
    <AnimatedTouchable
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

const MaterialCard = ({ item, onPress, delay }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scale = new Animated.Value(1);
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const animatedStyle = {
    transform: [{ scale }]
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
  
  const getFormattedPrice = (price) => {
    if (!price || parseFloat(price) === 0 || price === '0.00') {
      return t('Free');
    }
    return `${parseFloat(price).toLocaleString()} XAF`;
  };
  
  const formattedPrice = getFormattedPrice(item.price);
  const subjectName = item.subject?.name || item.subject || '';

  return (
    <AnimatedTouchable
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
        <View style={[styles.fileIconContainer, { backgroundColor: theme.primary }]}>
          <Icon name={fileIcon} size={24} color="#FFF" />
        </View>
        <View style={styles.recentCardContent}>
          <Text 
            style={[styles.recentCardTitle, { color: theme.textPrimary }]} 
            numberOfLines={2}
          >
            {typeof item.title === 'string' ? item.title : 'Untitled'}
          </Text>
          {item.description && (
            <Text 
              style={[styles.description, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          )}
          <View style={styles.cardMetaContainer}>
            {subjectName ? (
              <View style={[styles.subjectTag, { backgroundColor: theme.primaryContainer }]}>
                <Text style={[styles.subjectText, { color: theme.onPrimaryContainer }]} numberOfLines={1}>
                  {subjectName}
                </Text>
              </View>
            ) : null}
            <Text style={[styles.priceText, { color: theme.primary }]}>
              {formattedPrice}
            </Text>
          </View>
        </View>
        {item.thumbnail_url && (
          <Image 
            source={{ uri: item.thumbnail_url }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
      </LinearGradient>
    </AnimatedTouchable>
  );
};

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Fetching materials...');
        const response = await api.materials.getMaterials({ limit: 5, sort: '-created_at' });
        console.log('API Response:', response);
        
        if (response && response.items) {
          setMaterials(response.items.slice(0, 5));
          console.log('Set materials:', response.items.slice(0, 5));
        } else {
          console.log('No items found in response');
          setMaterials([]);
        }
      } catch (error) {
        console.error('Error loading materials:', error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const features = [
    {
      title: t('Materials'),
      icon: 'library-outline',
      gradient: ['#4CAF50', '#2E7D32'],
      onPress: () => navigation.navigate('Materials')
    },
    {
      title: t('Assignments'),
      icon: 'clipboard-outline',
      gradient: ['#2196F3', '#1565C0'],
      onPress: () => navigation.navigate('Assignments')
    },
    {
      title: t('Chat'),
      icon: 'chatbubbles-outline',
      gradient: ['#9C27B0', '#6A1B9A'],
      onPress: () => navigation.navigate('Chat')
    },
    {
      title: t('Settings'),
      icon: 'settings-outline',
      gradient: ['#FF9800', '#EF6C00'],
      onPress: () => navigation.navigate('Settings')
    },
  ];

  return (
    <ScreenLayout>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Image 
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.greeting, { color: theme.textPrimary }]}>
              {t('Welcome Back')}
            </Text>
          </View>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            {t('Access your study materials')}
          </Text>
        </View>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              icon={feature.icon}
              gradient={feature.gradient}
              onPress={feature.onPress}
              delay={index * 100}
            />
          ))}
        </View>

        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            {t('Recent Materials')}
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : materials.length > 0 ? (
            <>
              {materials.map((item, index) => (
                <MaterialCard
                  key={item.id || index}
                  item={item}
                  onPress={() => navigation.navigate('MaterialDetail', { id: item.id })}
                  delay={index * 100}
                />
              ))}
              <TouchableOpacity
                style={[styles.seeAllButton, { backgroundColor: theme.primaryContainer }]}
                onPress={() => navigation.navigate('Materials')}
              >
                <Text style={[styles.seeAllText, { color: theme.onPrimaryContainer }]}>
                  {t('See All Materials')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {t('No materials available')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  logo: {
    width: 60,
    height: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subGreeting: {
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 0,
  },
  cardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    height: 120,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recentSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'left',
    padding: 20,
    marginHorizontal: 0,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentCardContent: {
    flex: 1,
    marginHorizontal: 2,
  },
  recentCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  subjectTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  seeAllText: {
    fontSize: 14,
    marginRight: 4,
  },
  menuGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    padding: 2,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuItemText: {
    marginLeft: 16,
    fontSize: 18,
    fontWeight: '500',
  },
});

export default HomeScreen;
