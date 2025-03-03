import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from '../config/api';

export const registerForPushNotifications = async () => {
  try {
    if (!Device.isDevice) {
      // Running on simulator/emulator
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Get the token
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PROJECT_ID // Make sure this is set in your environment
    });

    // Platform-specific notification setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6803FF',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
};

export const configurePushNotifications = () => {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const scheduleLocalNotification = async (title, body, trigger = null) => {
  try {
    const notificationContent = {
      title,
      body,
      data: { type: 'local' },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    };

    if (trigger) {
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
      });
    } else {
      await Notifications.presentNotificationAsync(notificationContent);
    }
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
};

export const removePushNotificationSubscription = () => {
  try {
    Notifications.removeAllNotificationListeners();
  } catch (error) {
    console.error('Error removing notification subscription:', error);
  }
};

export default {
  registerForPushNotifications,
  configurePushNotifications,
  scheduleLocalNotification,
  removePushNotificationSubscription,
};
