import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import * as Device from 'expo-device';
import api from '../config/api';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { AnimatedButton } from '../components/AnimatedButton';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../services/notifications';

const STORAGE_KEY_NOTIFICATIONS = '@settings_notifications';

const SettingItem = ({ title, subtitle, onPress, value, type = 'arrow', theme, disabled = false }) => (
  <TouchableOpacity 
    style={[
      styles.settingItem, 
      { 
        backgroundColor: theme.surface,
        borderBottomColor: theme.border,
        opacity: disabled ? 0.5 : 1
      }
    ]} 
    onPress={onPress}
    disabled={disabled}
  >
    <View style={styles.settingInfo}>
      <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
    </View>
    {type === 'switch' ? (
      <Switch 
        value={value} 
        onValueChange={onPress}
        disabled={disabled}
        trackColor={{ false: '#767577', true: '#6803FF50' }}
        thumbColor={value ? '#6803FF' : '#f4f3f4'}
      />
    ) : (
      <Text style={[styles.settingArrow, { color: theme.textSecondary }]}>›</Text>
    )}
  </TouchableOpacity>
);

const SettingItem2 = ({ icon, title, onPress, color = '#6803FF' }) => (
  <TouchableOpacity style={styles.settingItem2} onPress={onPress}>
    <View style={styles.settingContent}>
      <Ionicons name={icon} size={24} color={color} style={styles.settingIcon} />
      <Text style={[styles.settingText, { color }]}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#C7C7CC" />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(null);
  const [pushToken, setPushToken] = useState(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  useEffect(() => {
    loadNotificationSettings();
    checkNotificationPermission();
    notificationService.configurePushNotifications();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const savedValue = await AsyncStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (savedValue !== null) {
        setNotifications(JSON.parse(savedValue));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const checkNotificationPermission = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      if (token) {
        setPushToken(token);
        setNotificationPermission('granted');
      } else {
        setNotificationPermission('denied');
      }
    } catch (error) {
      console.error('Error checking notification permission:', error);
      setNotificationPermission('denied');
    }
  };

  const handleNotificationToggle = async () => {
    try {
      if (!notifications) {
        const token = await notificationService.registerForPushNotifications();
        if (!token) {
          Alert.alert(
            t('settings.notifications.permission.title'),
            t('settings.notifications.permission.message'),
            [{ text: t('common.ok') }]
          );
          return;
        }

        setPushToken(token);
        setNotificationPermission('granted');

        // Register device with backend
        await api.notifications.registerDevice(token, {
          language: currentLanguage,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        // Test notification
        await notificationService.scheduleLocalNotification(
          t('settings.notifications.test.title'),
          t('settings.notifications.test.message')
        );
      } else {
        // Unregister device from backend
        if (pushToken) {
          await api.notifications.unregisterDevice(pushToken);
        }
        notificationService.removePushNotificationSubscription();
      }

      const newValue = !notifications;
      setNotifications(newValue);
      await AsyncStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(newValue));

    } catch (error) {
      console.error('Error toggling notifications:', error);
      Alert.alert(
        t('settings.notifications.error.title'),
        t('settings.notifications.error.message')
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: handleLogout, style: 'destructive' },
      ],
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLanguageSelect = async (language) => {
    await changeLanguage(language);
    setShowLanguageModal(false);
  };

  const LanguageModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showLanguageModal}
      onRequestClose={() => setShowLanguageModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{t('Select Language')}</Text>
          
          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === 'en' && { backgroundColor: '#6803FF20' }
            ]}
            onPress={() => handleLanguageSelect('en')}
          >
            <Text style={[
              styles.languageText,
              { color: currentLanguage === 'en' ? '#6803FF' : theme.text }
            ]}>{t('settings.language.options.en')}</Text>
            {currentLanguage === 'en' && (
              <Ionicons name="checkmark" size={24} color="#6803FF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.languageOption,
              currentLanguage === 'fr' && { backgroundColor: '#6803FF20' }
            ]}
            onPress={() => handleLanguageSelect('fr')}
          >
            <Text style={[
              styles.languageText,
              { color: currentLanguage === 'fr' ? '#6803FF' : theme.text }
            ]}>{t('settings.language.options.fr')}</Text>
            {currentLanguage === 'fr' && (
              <Ionicons name="checkmark" size={24} color="#6803FF" />
            )}
          </TouchableOpacity>

          <AnimatedButton
            title={t('Cancel')}
            onPress={() => setShowLanguageModal(false)}
            variant="secondary"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeScreen style={styles.container}>
      <StatusBar
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />
      <AnimatedBackground />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>{t('Settings')}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.preferences.title')}</Text>
          <SettingItem
            title={t('settings.notifications.push.title')}
            subtitle={notifications 
              ? t('settings.notifications.push.enabled')
              : t('settings.notifications.push.disabled')
            }
            type="switch"
            value={notifications}
            onPress={handleNotificationToggle}
            theme={theme}
            disabled={notificationPermission === 'denied'}
          />
          <SettingItem
            title={t('settings.language.title')}
            subtitle={currentLanguage === 'en' ? t('settings.language.options.en') : t('settings.language.options.fr')}
            type="switch"
            value={currentLanguage === 'fr'}
            onPress={() => changeLanguage(currentLanguage === 'en' ? 'fr' : 'en')}
            theme={theme}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('settings.app.title')}</Text>
          <SettingItem2
            icon="download-outline"
            title={t('navigation.downloads')}
            onPress={() => navigation.navigate('Downloads')}
          />
          <SettingItem2
            icon="information-circle-outline"
            title={t('settings.about.title')}
            onPress={() => navigation.navigate('About')}
          />
        </View>

        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: theme.surface }]}
          onPress={() => navigation.navigate('HelpCenter')}
        >
          <View style={styles.settingContent}>
            <View style={styles.settingIconContainer}>
              <Ionicons 
                name="help-circle-outline" 
                size={24} 
                color={theme.primary}
              />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>
                {t('settings.sections.help.helpCenter')}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {t('settings.sections.help.helpCenterDescription')}
              </Text>
            </View>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={theme.textSecondary}
          />
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <AnimatedButton
            title={t('auth.signOut')}
            onPress={confirmLogout}
            variant="secondary"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
      <LanguageModal />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingArrow: {
    fontSize: 20,
    marginLeft: 8,
  },
  settingItem2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    fontSize: 14,
    color: '#6803FF',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 16,
    marginBottom: 24,
  },
  signOutButton: {
    borderColor: '#FF3B30',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  languageText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: '#C7C7CC',
  },
});