import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SafeScreen from '../components/SafeScreen';
import Text from '../components/Text';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../config/api';

const NotificationItem = ({ item, onPress, onMarkRead, theme }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'material_added': return 'book-outline';
      case 'download_ready': return 'download-outline';
      case 'purchase_confirmed': return 'checkmark-circle-outline';
      case 'system_update': return 'information-circle-outline';
      default: return 'notifications-outline';
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { 
          backgroundColor: item.is_read ? theme.surfaceVariant : theme.primary + '10',
          borderLeftColor: theme.primary,
        }
      ]}
      onPress={() => onPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        <Icon 
          name={getNotificationIcon(item.type)} 
          size={24} 
          color={theme.primary} 
        />
      </View>
      <View style={styles.notificationContent}>
        <Text 
          style={[
            styles.notificationTitle, 
            { 
              color: theme.textPrimary,
              fontWeight: item.is_read ? 'normal' : 'bold'
            }
          ]}
        >
          {item.title}
        </Text>
        <Text 
          style={[
            styles.notificationDescription, 
            { color: theme.textSecondary }
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text 
          style={[
            styles.notificationTime, 
            { color: theme.textSecondary }
          ]}
        >
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
      {!item.is_read && (
        <TouchableOpacity 
          style={styles.markReadButton}
          onPress={() => onMarkRead(item.id)}
        >
          <Icon name="checkmark-done" size={20} color={theme.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function NotificationsScreen({ navigation }) {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.notifications.getUnread();
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.notifications.markAsRead([notificationId]);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = (notification) => {
    // Navigate to specific screen based on notification type
    switch (notification.type) {
      case 'material_added':
        navigation.navigate('MaterialDetails', { materialId: notification.related_id });
        break;
      case 'download_ready':
        navigation.navigate('Downloads');
        break;
      default:
        // Generic handling or do nothing
        break;
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <SafeScreen style={{ backgroundColor: theme.background }}>
      <StatusBar 
        barStyle={theme.statusBar}
        backgroundColor={theme.background}
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon 
            name="notifications-off-outline" 
            size={64} 
            color={theme.textSecondary} 
          />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            No new notifications
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationItem
              item={item}
              theme={theme}
              onPress={handleNotificationPress}
              onMarkRead={markNotificationAsRead}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.primary]}
              tintColor={theme.primary}
            />
          }
        />
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderLeftWidth: 4,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  notificationIconContainer: {
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
  },
  markReadButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
  },
});