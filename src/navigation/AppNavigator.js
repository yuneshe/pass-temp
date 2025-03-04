import React from 'react';
import { View, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import MaterialsScreen from '../screens/MaterialsScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import MaterialDetailScreen from '../screens/MaterialDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import CreateChatSubjectScreen from '../screens/CreateChatSubjectScreen';
import ChatDiscussionScreen from '../screens/ChatDiscussionScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChatRoomScreen from '../screens/ChatRoomScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { t } = useTranslation();
  const { theme } = useSettings();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = focused ? '#6803FF' : '#666666';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Materials':
              iconName = focused ? 'library' : 'library-outline';
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
          }

          return (
            <View 
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 32,
              }}
            >
              <Icon name={iconName} size={24} color={iconColor} />
              {focused && (
                <View 
                  style={{
                    position: 'absolute',
                    bottom: -8,
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: '#6803FF',
                  }}
                />
              )}
            </View>
          );
        },
        tabBarStyle: {
          height: 64,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarActiveTintColor: '#6803FF',
        tabBarInactiveTintColor: '#666666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t('navigation.home') }} />
      <Tab.Screen 
        name="Materials" 
        component={MaterialsScreen} 
        options={{ 
          title: t('navigation.materials'),
          headerShown: true,
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#6803FF',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }} 
      />
      <Tab.Screen name="Downloads" component={DownloadsScreen} options={{ title: t('navigation.downloads') }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ title: t('navigation.chat') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('navigation.settings') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { theme } = useSettings();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabs}
          />
          <Stack.Screen 
            name="MaterialDetails" 
            component={MaterialDetailScreen}
            options={{
              title: t('navigation.materialDetail'),
            }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: t('navigation.profile'),
              headerStyle: {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
              },
              headerTintColor: theme.colors.text,
            }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              headerShown: true,
              title: t('navigation.notifications'),
              headerStyle: {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
              },
              headerTintColor: theme.colors.text,
            }}
          />
          <Stack.Screen 
            name="ChangePassword" 
            component={ProfileScreen}
            options={{
              headerShown: true,
              title: t('navigation.changePassword'),
              headerStyle: {
                backgroundColor: theme.colors.card,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
              },
              headerTintColor: theme.colors.text,
            }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: t('navigation.chat') }}
          />
          <Stack.Screen
            name="CreateChatSubject"
            component={CreateChatSubjectScreen}
            options={{ title: t('navigation.createChatSubject') }}
          />
          <Stack.Screen
            name="ChatDiscussion"
            component={ChatDiscussionScreen}
            options={({ route }) => ({
              title: route.params?.title || t('navigation.chat'),
            })}
          />
          <Stack.Screen
            name="ChatRoom"
            component={ChatRoomScreen}
            options={{
              headerShown: true,
              headerStyle: {
                backgroundColor: '#6803FF',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen
            name="VideoPlayer"
            component={VideoPlayerScreen}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animationEnabled: true,
              cardStyle: { backgroundColor: '#000000' }
            }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
