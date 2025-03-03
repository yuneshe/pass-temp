import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../context/SettingsContext';

import HomeScreen from '../screens/HomeScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { t } = useTranslation();
  const { theme } = useSettings();

  const getTabBarIcon = (routeName, focused) => {
    let iconName;

    switch (routeName) {
      case 'Home':
        iconName = focused ? 'home' : 'home-outline';
        break;
      case 'Materials':
        iconName = focused ? 'book' : 'book-outline';
        break;
      case 'Downloads':
        iconName = focused ? 'download' : 'download-outline';
        break;
      case 'Chat':
        iconName = focused ? 'chatbubble' : 'chatbubble-outline';
        break;
      case 'Settings':
        iconName = focused ? 'settings' : 'settings-outline';
        break;
      default:
        iconName = 'help-circle';
    }

    return (
      <Icon
        name={iconName}
        size={24}
        color={focused ? theme.colors.primary : theme.colors.text}
      />
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getTabBarIcon(route.name, focused),
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: theme.colors.card,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarItemStyle: {
          margin: 5,
          borderRadius: 15,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('navigation.home') }} 
      />
      <Tab.Screen 
        name="Materials" 
        component={MaterialsScreen} 
        options={{ 
          title: t('navigation.materials'),
          headerShown: false 
        }} 
      />
      <Tab.Screen 
        name="Downloads" 
        component={DownloadsScreen} 
        options={{ title: t('navigation.downloads') }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{ title: t('navigation.chat') }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t('navigation.profile') }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: t('navigation.settings') }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
