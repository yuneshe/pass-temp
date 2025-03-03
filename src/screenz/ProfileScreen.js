import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [user, setUser] = useState({
    name: '',
    email: '',
    avatar: '',
    phone: '',
    joinDate: '',
  });
  const [userStats, setUserStats] = useState({
    totalDownloads: 0,
    totalMaterials: 0,
    completedMaterials: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(route.params?.isEditing || false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Update editing state if passed from route
    if (route.params?.isEditing !== undefined) {
      setIsEditing(route.params.isEditing);
    }
    
    // Update changing password state if passed from route
    if (route.params?.isChangingPassword !== undefined) {
      setIsChangingPassword(route.params.isChangingPassword);
    }
  }, [route.params?.isEditing, route.params?.isChangingPassword]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!isChangingPassword && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Icon
                name={isEditing ? 'close-outline' : 'create-outline'}
                size={24}
                color={theme.primary}
              />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsChangingPassword(!isChangingPassword)}
          >
            <Icon
              name={isChangingPassword ? 'close-outline' : 'key-outline'}
              size={24}
              color={theme.primary}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [isEditing, isChangingPassword, navigation, theme]);

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await api.profile.get();
      if (response) {
        setUser({
          name: response.name || '',
          email: response.email || '',
          avatar: response.avatar_url || response.avatar || '',
          phone: '', // Backend doesn't provide phone in this response
          joinDate: response.created_at || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Profile Error:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      // Fetch server-side stats
      const statsResponse = await api.profile.getStats();
      
      // Count local downloads
      const downloadsJson = await AsyncStorage.getItem('@downloads');
      console.log('Raw Downloads JSON:', downloadsJson);
      
      const localDownloads = downloadsJson ? Object.keys(JSON.parse(downloadsJson)).length : 0;
      console.log('Local Downloads Count:', localDownloads);
      
      setUserStats({
        totalDownloads: localDownloads,
        totalMaterials: statsResponse?.data?.totalMaterials || 0,
        completedMaterials: statsResponse?.data?.completedMaterials || 0,
      });
    } catch (error) {
      console.error('User Stats Error:', error);
      // Fallback to zero downloads if there's an error
      setUserStats({
        totalDownloads: 0,
        totalMaterials: 0,
        completedMaterials: 0,
      });
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.profile.update(user);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    if (!isEditing) return;
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUser(prev => ({ ...prev, avatar: result.assets[0].uri }));
    }
  };

  if (loading) {
    return (
      <SafeScreen style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[theme.primary + '20', theme.background]}
          style={styles.headerGradient}
        >
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} disabled={!isEditing}>
              {user.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.surfaceVariant }]}>
                  <Icon name="person" size={40} color={theme.textSecondary} />
                </View>
              )}
              {isEditing && (
                <View style={[styles.editBadge, { backgroundColor: theme.primary }]}>
                  <Icon name="camera" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.textPrimary,
                  backgroundColor: theme.surfaceVariant,
                  borderColor: theme.border
                }
              ]}
              value={user.name}
              onChangeText={(text) => setUser(prev => ({ ...prev, name: text }))}
              editable={isEditing}
              placeholder="Enter your name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.textPrimary,
                  backgroundColor: theme.surfaceVariant,
                  borderColor: theme.border
                }
              ]}
              value={user.email}
              onChangeText={(text) => setUser(prev => ({ ...prev, email: text }))}
              editable={isEditing}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  color: theme.textPrimary,
                  backgroundColor: theme.surfaceVariant,
                  borderColor: theme.border
                }
              ]}
              value={user.phone}
              onChangeText={(text) => setUser(prev => ({ ...prev, phone: text }))}
              editable={isEditing}
              placeholder="Enter your phone number"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Join Date</Text>
            <Text style={[styles.staticText, { color: theme.textPrimary }]}>
              {new Date(user.joinDate).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.statsTitle, { color: theme.textPrimary }]}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {userStats.totalDownloads}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total Downloads
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {userStats.totalMaterials}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Total Materials
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.primary }]}>
                  {userStats.completedMaterials}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  Completed
                </Text>
              </View>
            </View>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  saveButton: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButton: {
    paddingHorizontal: 16,
  },
  statsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  staticText: {
    fontSize: 16,
    paddingVertical: 12,
  },
});

export default ProfileScreen;