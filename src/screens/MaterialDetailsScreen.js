import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import * as IntentLauncher from 'expo-intent-launcher';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import SafeScreen from '../components/SafeScreen';
import api from '../config/api';
import { useTheme } from '../context/ThemeContext';
import { formatFileSize, formatPrice, getFileTypeIcon } from '../utils/formatters';
import Text from '../components/Text';
import FlutterwaveService from '../services/flutterwaveService';
import { PayWithFlutterwave } from 'flutterwave-react-native';
import MoMoPaymentModal from '../components/MoMoPaymentModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MetadataItem = ({ label, value, theme, navigation, item, hierarchyData }) => {
  const { t } = useTranslation();
  const handlePress = () => {
    if (item && navigation) {
      const navigationParams = {
        categoryId: label === t('materialDetails.metadata.category') ? item.id : undefined,
        subjectId: label === t('materialDetails.metadata.subject') ? item.id : undefined,
        levelId: label === t('materialDetails.metadata.level') ? item.id : undefined,
        parentId: hierarchyData?.parentId,
        title: `${label}: ${item.name}`
      };
      navigation.navigate('Materials', navigationParams);
    }
  };

  if (!value) return null;

  const displayValue = hierarchyData 
    ? `${hierarchyData.parentName ? `${hierarchyData.parentName} > ` : ''}${value}`
    : value;

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={styles.metadataItemContainer}
    >
      <Text style={[styles.metadataLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text 
        style={[
          styles.metadataValue, 
          { 
            color: theme.textPrimary,
            fontWeight: hierarchyData?.parentName ? 'bold' : 'normal'
          }
        ]}
      >
        {displayValue}
      </Text>
    </TouchableOpacity>
  );
};

const ImageViewer = ({ visible, imageUrl, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: theme.surfaceVariant }]}
          onPress={onClose}
        >
          <Icon name="close" size={24} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />
        </View>
      </Animated.View>
    </Modal>
  );
};

export default function MaterialDetailsScreen({ route, navigation }) {
  const { material: initialMaterial } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [material, setMaterial] = useState(initialMaterial);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedFile, setDownloadedFile] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showMoMoPayment, setShowMoMoPayment] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState(null);
  const [fileSize, setFileSize] = useState(route.params?.material?.file_size);
  const [showImageViewer, setShowImageViewer] = useState(false);

  useEffect(() => {
    checkDownloadStatus();
  }, []);

  useEffect(() => {
    console.log('Material State Detailed:', {
      initialFileSize: route.params?.material?.file_size,
      currentMaterialFileSize: material?.file_size,
      fileType: typeof material?.file_size,
      materialExists: !!material,
      fullMaterial: material
    });
  }, [material, route.params]);

  useEffect(() => {
    if (route.params?.material?.file_size) {
      setFileSize(route.params.material.file_size);
    }
  }, [route.params?.material?.file_size]);

  useEffect(() => {
    if (material) {
    }
  }, [material]);

  const handleMoMoPurchase = () => {
    setShowMoMoPayment(true);
  };

  const handleMoMoPaymentSuccess = async () => {
    try {
      await api.materials.purchaseMaterial(material.id);
      Alert.alert(
        t('materialDetails.alerts.success'),
        t('materialDetails.alerts.paymentSuccess'),
        [
          {
            text: 'OK',
            onPress: () => loadMaterial()
          }
        ]
      );
    } catch (error) {
      console.error('Material purchase error:', error);
      Alert.alert(t('materialDetails.alerts.error'), t('materialDetails.alerts.purchaseError'));
    }
  };

  const handlePurchase = async () => {
    Alert.alert(
      t('materialDetails.payment.chooseMethod'),
      t('materialDetails.payment.selectPayment'),
      [
        {
          text: t('materialDetails.payment.mtnMomo'),
          onPress: handleMoMoPurchase,
        },
        {
          text: t('materialDetails.payment.flutterwave'),
          onPress: async () => {
            try {
              setIsLoading(true);
              const orderId = `ORDER-${Date.now()}`;
              
              const options = await FlutterwaveService.initializePayment({
                amount: material.price,
                email: material.user_email,
                phoneNumber: material.user_phone || '',
                name: material.user_name || 'User',
                orderId,
                description: `Purchase of ${material.title}`,
              });

              setPaymentOptions(options);
              setShowPayment(true);
              setIsLoading(false);
            } catch (error) {
              console.error('Purchase error:', error);
              setIsLoading(false);
              Alert.alert(t('materialDetails.alerts.error'), t('materialDetails.alerts.processingError'));
            }
          },
        },
        {
          text: t('materialDetails.payment.cancel'),
          style: 'cancel',
        }
      ]
    );
  };

  const handlePaymentComplete = async (data) => {
    try {
      setShowPayment(false);
      setIsLoading(true);

      if (data.status === 'successful') {
        const verificationResult = await FlutterwaveService.verifyTransaction(data.transaction_id);
        if (verificationResult.success) {
          await api.materials.purchaseMaterial(material.id);
          Alert.alert(
            t('materialDetails.alerts.success'),
            t('materialDetails.alerts.paymentSuccess'),
            [
              {
                text: 'OK',
                onPress: () => loadMaterial()
              }
            ]
          );
        } else {
          Alert.alert(t('materialDetails.alerts.error'), t('materialDetails.alerts.paymentFailed'));
        }
      } else {
        Alert.alert(t('materialDetails.alerts.error'), t('materialDetails.alerts.paymentNotSuccessful'));
      }
    } catch (error) {
      console.error('Payment completion error:', error);
      Alert.alert(t('materialDetails.alerts.error'), t('materialDetails.alerts.processingError'));
    } finally {
      setIsLoading(false);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (initialMaterial?.id) {
      loadMaterial();
    }
  }, [initialMaterial]);

  const loadMaterial = async () => {
    try {
      setIsLoading(true);
      const { material } = await api.materials.getMaterial(initialMaterial.id);
      setMaterial(material);
    } catch (error) {
      console.error('Error loading material:', error);
      Alert.alert(t('materialDetails.alerts.error'), error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDownloadStatus = async () => {
    try {
      const storedDownloads = await AsyncStorage.getItem('@downloads') || '{}';
      const downloads = JSON.parse(storedDownloads);
      const downloadInfo = downloads[material.id];

      if (downloadInfo) {
        const fileInfo = await FileSystem.getInfoAsync(downloadInfo.file_path);
        if (fileInfo.exists) {
          setDownloadedFile(downloadInfo.file_path);
        }
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking download status:', error);
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const { download_url } = await api.materials.getDownloadUrl(material.id);
      if (!download_url) {
        throw new Error(t('materialDetails.alerts.fileNotFound'));
      }

      console.log('Download URL:', download_url);
      const fileName = material.file_url.split('/').pop();
      
      const directory = FileSystem.documentDirectory + 'downloads/';
      const filePath = directory + fileName;

      const dirInfo = await FileSystem.getInfoAsync(directory);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      }

      console.log('Starting download from:', download_url);
      console.log('Saving to:', filePath);

      const downloadResumable = FileSystem.createDownloadResumable(
        download_url,
        filePath,
        {
          headers: {
            'Accept': '*/*'
          }
        },
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (!result) {
        throw new Error(t('materialDetails.alerts.downloadError'));
      }

      console.log('Download completed:', result);

      const downloads = JSON.parse(await AsyncStorage.getItem('@downloads') || '{}');
      downloads[material.id] = {
        id: material.id,
        title: material.title,
        file_url: material.file_url,
        file_path: result.uri,
        mime_type: material.file_type,
        downloadDate: new Date().toISOString(),
        fileInfo: {
          size: result.size,
          exists: true,
          uri: result.uri
        }
      };
      await AsyncStorage.setItem('@downloads', JSON.stringify(downloads));

      setDownloadedFile(result.uri);
      setIsDownloading(false);
      setDownloadProgress(1);

      Alert.alert(
        t('materialDetails.alerts.success'),
        t('materialDetails.alerts.downloadSuccess'),
        [
          {
            text: t('materialDetails.actions.viewNow'),
            onPress: handleView
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Download error:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      Alert.alert(
        t('materialDetails.alerts.error'), 
        t('materialDetails.alerts.downloadError', { error: error.message })
      );
    }
  };

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

  const handleView = async () => {
    try {
      if (!downloadedFile) {
        throw new Error(t('materialDetails.alerts.fileNotFound'));
      }

      const fileInfo = await FileSystem.getInfoAsync(downloadedFile);
      if (!fileInfo.exists) {
        throw new Error(t('materialDetails.alerts.fileNotFound'));
      }

      const fileName = downloadedFile.split('/').pop();
      const mimeType = material.mime_type || detectMimeType(fileName);

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
          title: material.title
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
      Alert.alert(t('materialDetails.alerts.error'), error.message);
    }
  };

  const handleViewImage = () => {
    setShowImageViewer(true);
  };

  const handleCloseImage = () => {
    setShowImageViewer(false);
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeScreen>
    );
  }

  if (!material) {
    return (
      <SafeScreen>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textPrimary }]}>
            {t('materialDetails.alerts.materialNotFound')}
          </Text>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <LinearGradient
        colors={[theme.primary + '20', theme.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
        style={styles.container}
      >
        <ImageViewer
          visible={showImageViewer}
          imageUrl={material.thumbnail}
          onClose={handleCloseImage}
        />
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => navigation.goBack()}
              >
                <Icon name="arrow-back" size={24} color={theme.primary} />
              </TouchableOpacity>
              <View>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                  {t('materialDetails.header.title')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                  {t('materialDetails.header.subtitle')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: theme.surfaceVariant }]}
                onPress={() => Alert.alert(t('materialDetails.alerts.share'), t('materialDetails.alerts.shareComingSoon'))}
              >
                <Icon name="share-social" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <View 
            style={styles.materialContent}
          >
            <LinearGradient
              colors={[theme.surfaceVariant, theme.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.materialCard, { borderColor: theme.border }]}
            >
              <TouchableOpacity
                style={styles.thumbnailContainer}
                onPress={handleViewImage}
                activeOpacity={0.9}
              >
                <Image
                  source={material.thumbnail 
                    ? { uri: material.thumbnail } 
                    : require('../assets/images/default-thumbnail.png')}
                  style={styles.thumbnail}
                  resizeMode="cover"
                  
                  onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
                  onLoad={() => console.log('Image loaded successfully:', material.thumbnail)}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.thumbnailOverlay}
                />
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Icon name={getFileTypeIcon(material.type)} size={24} color="white" />
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={2}>{material.title}</Text>
                    <Text style={styles.subtitle} numberOfLines={1}>{material.category?.name}</Text>
                  </View>
                  {material.price > 0 ? (
                    <View style={[styles.priceBadge, { backgroundColor: theme.primary }]}>
                      <Text style={styles.priceText}>{formatPrice(material.price)}</Text>
                    </View>
                  ) : (
                    <View style={[styles.priceBadge, { backgroundColor: '#E3F2FD' }]}>
                      <Text style={[styles.priceText, { color: '#2196F3' }]}>FREE</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.cardContent}>
                <Text 
                  style={[
                    styles.description, 
                    { 
                      color: theme.textPrimary, 
                      fontWeight: '900', 
                      fontSize: 17, 
                      lineHeight: 26, 
                      letterSpacing: 0.7,
                      opacity: 0.9
                    }
                  ]} 
                >
                  {material.description}
                </Text>

                <View style={styles.statsGrid}>
                  <View style={styles.statsItem}>
                    <Icon name="document-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.statsText, { color: theme.textSecondary, fontWeight: 'bold' }]}>
                      {t('materialDetails.stats.fileSize')}: {fileSize || t('materialDetails.stats.unknown')}
                    </Text>
                  </View>
                </View>

                <View style={[styles.metadataContainer, { backgroundColor: theme.surfaceVariant }]}>
                  <MetadataItem label={t('materialDetails.metadata.category')} value={material.category?.name} theme={theme} navigation={navigation} item={material.category} />
                  <MetadataItem label={t('materialDetails.metadata.subject')} value={material.subject?.name} theme={theme} navigation={navigation} item={material.subject} />
                  <MetadataItem label={t('materialDetails.metadata.level')} value={material.level?.name} theme={theme} navigation={navigation} item={material.level} />
                  
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>{t('materialDetails.metadata.status')}</Text>
                    <View 
                      style={[
                        styles.statusBadge, 
                        { 
                          backgroundColor: material.price === 0
                            ? 'rgba(33, 150, 243, 0.2)' 
                            : material.status === 'paid' 
                              ? 'rgba(76, 175, 80, 0.2)' 
                              : 'rgba(244, 67, 54, 0.2)' 
                        }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.statusText, 
                          { 
                            color: material.price === 0
                              ? '#2196F3' 
                              : material.status === 'paid' 
                                ? 'green' 
                                : 'red' 
                          }
                        ]}
                      >
                        {material.price === 0 ? t('materialDetails.metadata.free') : material.status === 'paid' ? t('materialDetails.metadata.paid') : t('materialDetails.metadata.unpaid')}
                      </Text>
                    </View>
                  </View>
                </View>

                {isDownloading ? (
                  <View style={[styles.actionButton, { backgroundColor: theme.primary }]}>
                    <ActivityIndicator color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>
                      {t('materialDetails.loading.downloading')}... {Math.round(downloadProgress * 100)}%
                    </Text>
                  </View>
                ) : downloadedFile ? (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                    onPress={handleView}
                  >
                    <Icon name="eye-outline" size={24} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('materialDetails.actions.view')}</Text>
                  </TouchableOpacity>
                ) : material.price > 0 && !material.has_purchase ? (
                  <TouchableOpacity 
                    style={[
                      styles.purchaseButton, 
                      { 
                        backgroundColor: theme.primary,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    ]}
                    onPress={handlePurchase}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <ActivityIndicator color="white" style={styles.buttonIcon} />
                        <Text style={styles.purchaseButtonText}>
                          {t('materialDetails.loading.processing')}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Icon 
                          name="cart" 
                          size={20} 
                          color="white" 
                          style={{ marginRight: 10 }} 
                        />
                        <Text style={styles.purchaseButtonText}>
                          {t('materialDetails.actions.purchase')} - {formatPrice(material.price)}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={handleDownload}
                  >
                    <Icon name="download-outline" size={24} color="white" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>{t('materialDetails.actions.download')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
      {showPayment && paymentOptions && (
        <PayWithFlutterwave
          onRedirect={handlePaymentComplete}
          options={paymentOptions}
        />
      )}
      <MoMoPaymentModal
        visible={showMoMoPayment}
        onClose={() => setShowMoMoPayment(false)}
        material={material}
        onPaymentSuccess={handleMoMoPaymentSuccess}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
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
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialContent: {
    padding: 16,
    paddingTop: 8,
  },
  materialCard: {
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
  thumbnailContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    marginLeft: 4,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  priceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 100,
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metadataContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  metadataLabel: {
    fontSize: 14,
  },
  metadataValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metadataItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  purchaseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    borderRadius: 100,
    marginTop: 16,
  },
  purchaseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
