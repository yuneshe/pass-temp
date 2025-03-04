import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { getTheme } from '../theme';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

const getFileIcon = (fileType) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf':
      return 'document-text';
    case 'doc':
    case 'docx':
      return 'document-text';
    case 'ppt':
    case 'pptx':
      return 'easel';
    case 'xls':
    case 'xlsx':
      return 'grid';
    case 'video':
      return 'videocam';
    case 'audio':
      return 'musical-notes';
    case 'zip':
    case 'rar':
      return 'archive';
    default:
      return 'document';
  }
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatPrice = (price) => {
  if (!price || price <= 0) return 'Free';
  return `${price.toLocaleString()} XAF`;
};

const MaterialCard = ({
  material,
  onPress,
  style,
  width,
}) => {
  const { isDarkMode } = useSettings();
  const theme = getTheme(isDarkMode);
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

  if (!material || typeof material !== 'object') return null;

  const {
    id,
    title = '',
    thumbnail = null,
    author = '',
    price = 0,
    rating = 0,
    stats = { total: 0 },
    downloads_stats = { total: 0 },
    category = '',
    subject = '',
    level = '',
    fileType = '',
    size = 0,
  } = material;

  const fileIcon = getFileIcon(fileType);

  return (
    <TouchableOpacity
      onPress={() => onPress(material)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View 
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.card,
            width: width || '100%',
            transform: [{ scale }],
          },
          style,
        ]}
      >
        <View style={styles.imageContainer}>
          {thumbnail ? (
            <Image
              source={{ uri: thumbnail }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.placeholderContainer, { backgroundColor: theme.colors.border }]}>
              <Icon name={fileIcon} size={40} color={theme.colors.text} />
            </View>
          )}
          <View
            style={[
              styles.overlay,
              {
                backgroundColor: isDarkMode 
                  ? 'rgba(0, 0, 0, 0.5)' 
                  : 'rgba(255, 255, 255, 0.8)',
              }
            ]}
          >
            <View style={styles.fileInfo}>
              <Icon name={fileIcon} size={16} color={theme.colors.text} />
              <Text style={[styles.fileSize, { color: theme.colors.text }]}>
                {formatFileSize(size)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
            {title}
          </Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.meta}>
              <Icon name="person-outline" size={14} color={theme.colors.text} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.colors.text }]} numberOfLines={1}>
                {author || 'Unknown'}
              </Text>
            </View>
            
            <View style={styles.meta}>
              <Icon name="download-outline" size={14} color={theme.colors.text} style={styles.metaIcon} />
              <Text style={[styles.metaText, { color: theme.colors.text }]}>
                {downloads_stats?.total || 0}
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.badges}>
              {category && (
                <View style={[styles.badge, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.primary }]} numberOfLines={1}>
                    {typeof category === 'object' ? category.name : category}
                  </Text>
                </View>
              )}
              {level && (
                <View style={[styles.badge, { backgroundColor: theme.colors.secondary + '15' }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.secondary }]} numberOfLines={1}>
                    {typeof level === 'object' ? level.name : level}
                  </Text>
                </View>
              )}
            </View>
            {price > 0 && (
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {formatPrice(price)}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
    backgroundColor: '#f0f0f0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fileSize: {
    fontSize: 12,
    marginLeft: 4,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '48%',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default MaterialCard;
