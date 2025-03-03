import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Animated,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Button from '../components/Button';
import SafeScreen from '../components/SafeScreen';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import api from '../config/api';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { Easing } from 'react-native';
import BottomSheetModal from '../components/BottomSheetModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ChatScreenHeader = ({ title, onBack, onAdd, showAdd }) => {
  const { theme } = useSettings();

  return (
    <Animated.View style={[styles.header]}>
      <LinearGradient
        colors={['#6803FF', '#4A02B3']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView intensity={20} tint="dark" style={[StyleSheet.absoluteFill, { opacity: 0.7 }]} />
      <View style={styles.headerContent}>
        {onBack && (
          <TouchableOpacity 
            onPress={onBack} 
            style={styles.headerButton}
          >
            <Icon name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        {showAdd && (
          <TouchableOpacity 
            onPress={onAdd} 
            style={[styles.headerButton, styles.addButton]}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const ChatSubjectItem = ({ subject, onPress, index }) => {
  const { theme } = useSettings();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: index * 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]);
    
    animation.start();
    
    return () => animation.stop();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start(() => onPress());
  };
  
  return (
    <Animated.View
      style={[
        styles.subjectItem,
        {
          opacity,
          transform: [
            { scale: scaleAnim },
            { translateY },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={[styles.subjectItemInner]} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(104, 3, 255, 0.08)', 'rgba(104, 3, 255, 0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.subjectGradient]}
        />
        <View style={styles.subjectIconContainer}>
          <LinearGradient
            colors={['#6803FF', '#4A02B3']}
            style={styles.subjectIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="book-outline" size={20} color="#FFFFFF" />
          </LinearGradient>
        </View>
        <View style={styles.subjectContent}>
          <Text style={styles.subjectTitle} numberOfLines={1}>
            {subject.name}
          </Text>
          <Text style={styles.subjectMeta} numberOfLines={1}>
            {subject.description}
          </Text>
          <View style={styles.subjectStats}>
            <View style={styles.statItem}>
              <Icon name="document-text-outline" size={14} color="#666666" />
              <Text style={styles.statText}>{subject.materials_count} materials</Text>
            </View>
          </View>
        </View>
        <View style={styles.subjectArrowContainer}>
          <LinearGradient
            colors={['rgba(104, 3, 255, 0.1)', 'rgba(104, 3, 255, 0.05)']}
            style={styles.subjectArrow}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="chevron-forward" size={18} color="#6803FF" />
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ChatItem = ({ chat, onPress, index }) => {
  const { theme } = useSettings();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        tension: 50,
        friction: 7,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]);
    
    animation.start();
    
    return () => animation.stop();
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Animated.View
      style={[
        styles.chatItem,
        {
          opacity,
          transform: [{ translateX }],
        },
      ]}
    >
      <TouchableOpacity 
        style={[styles.chatItemInner]}
        onPress={() => onPress(chat)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(104, 3, 255, 0.08)', 'rgba(104, 3, 255, 0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.chatGradient]}
        />
        <View style={styles.chatAvatarContainer}>
          <LinearGradient
            colors={['#6803FF', '#4A02B3']}
            style={styles.chatAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.chatAvatarText}>
              {chat.title.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatTitleRow}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {chat.title}
            </Text>
            <Text style={styles.chatTime}>
              {formatTime(chat.created_at)}
            </Text>
          </View>
          <Text style={styles.chatMeta} numberOfLines={1}>
            {chat.last_message || 'No messages'} • {chat.participants_count} participants
          </Text>
          <Text style={styles.chatCreator} numberOfLines={1}>
            Created by {chat.created_by?.user?.name || chat.created_by?.name || 'Unknown'}
          </Text>
        </View>
        {chat.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{chat.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const EmptyState = ({ message, theme }) => (
  <View style={styles.emptyState}>
    <LinearGradient
      colors={['rgba(104, 3, 255, 0.1)', 'rgba(104, 3, 255, 0.05)']}
      style={styles.emptyIconContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Icon name="chatbubbles-outline" size={32} color="#6803FF" />
    </LinearGradient>
    <Text style={styles.emptyText}>
      {message}
    </Text>
    <Text style={styles.emptySubtext}>
      Start a conversation or join an existing one
    </Text>
  </View>
);

export default function ChatScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useSettings();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchSubjects = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (search) {
        params.search = search.trim();
      }
      
      const result = await api.chat.getSubjects(params);
      
      if (!result?.data) {
        throw new Error(t('chat.fetchError'));
      }
      
      // Handle both formats: direct array or wrapped in data
      const subjects = Array.isArray(result.data) ? result.data : result.data.subjects || [];
      
      setSubjects(subjects);
      if (subjects.length === 0 && search) {
        setError(t('chat.noSearchResults'));
      }
    } catch (err) {
      console.error('Error fetching subjects:', err);
      setError(err.message || t('chat.fetchError'));
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Clear results immediately if search is empty
    if (!text.trim()) {
      fetchSubjects();
      return;
    }
    
    // Set new timeout to debounce search
    const timeout = setTimeout(() => {
      fetchSubjects(text);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const fetchChats = async () => {
    if (!selectedSubject) {
      setChats([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await api.chat.getChats(selectedSubject.id);
      
      // Handle both formats: direct array, wrapped in data, or double-wrapped
      const chats = Array.isArray(result) ? result : 
                   Array.isArray(result?.data) ? result.data :
                   result?.data?.data || [];
      
      if (chats.length > 0) {
        setChats(chats);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError(err.message || 'Failed to fetch chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!newChatTitle.trim() || !selectedSubject) return;

    setCreatingChat(true);
    try {
      const response = await api.chat.createChat(selectedSubject.id, {
        title: newChatTitle.trim(),
      });
      
      setChats(prevChats => [response, ...prevChats]);
      setNewChatTitle('');
      setNewChatVisible(false);
      
      navigation.navigate('ChatRoom', { chat: response });
    } catch (err) {
      console.error('Error creating chat:', err);
      setError(err.message || 'Failed to create chat');
    } finally {
      setCreatingChat(false);
    }
  };

  const handleSubjectPress = (subject) => {
    setSelectedSubject(subject);
  };

  const handleChatPress = (chat) => {
    navigation.navigate('ChatRoom', { chat });
  };

  const handleBackPress = () => {
    setSelectedSubject(null);
    setChats([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (selectedSubject) {
        await fetchChats();
      } else {
        await fetchSubjects(searchQuery);
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchChats();
  }, [selectedSubject]);

  return (
    <SafeScreen style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6803FF" />
      <AnimatedBackground />
      
      <ChatScreenHeader
        title={selectedSubject ? selectedSubject.name : t('chat.title')}
        onBack={selectedSubject ? handleBackPress : undefined}
        onAdd={() => setNewChatVisible(true)}
        showAdd={!!selectedSubject}
      />
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color="#6803FF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('chat.searchPlaceholder')}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery ? (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                fetchSubjects('');
              }}
              style={styles.clearButton}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#6803FF" />
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Icon name="alert-circle-outline" size={48} color="#6803FF" />
            <Text style={styles.errorText}>
              {error}
            </Text>
            <Button
              title="Try Again"
              onPress={selectedSubject ? fetchChats : () => fetchSubjects(searchQuery)}
              variant="secondary"
              style={styles.retryButton}
            />
          </View>
        ) : (
          <FlatList
            data={selectedSubject ? chats : subjects}
            renderItem={({ item, index }) => 
              selectedSubject ? (
                <ChatItem
                  chat={item}
                  onPress={handleChatPress}
                  index={index}
                />
              ) : (
                <ChatSubjectItem
                  subject={item}
                  onPress={() => handleSubjectPress(item)}
                  index={index}
                />
              )
            }
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              !loading && !error && (
                <EmptyState
                  message={selectedSubject ? 'No chats in this subject yet' : 'No subjects available'}
                  theme={theme}
                />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#6803FF']}
                tintColor="#6803FF"
              />
            }
          />
        )}
      </View>

      <BottomSheetModal
        visible={newChatVisible}
        onClose={() => {
          setNewChatVisible(false);
          setNewChatTitle('');
        }}
        height={0.4}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Create New Chat
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter chat title"
            placeholderTextColor="#666666"
            value={newChatTitle}
            onChangeText={setNewChatTitle}
            autoFocus
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setNewChatVisible(false);
                setNewChatTitle('');
              }}
            >
              <Text style={styles.buttonText}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                { opacity: !newChatTitle.trim() || creatingChat ? 0.5 : 1 }
              ]}
              onPress={handleCreateChat}
              disabled={!newChatTitle.trim() || creatingChat}
            >
              {creatingChat ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>
                  Create Chat
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: Platform.OS === 'ios' ? 100 : 70,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    overflow: 'hidden',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 16,
  },
  subjectItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subjectItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#6803FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectGradient: {
    borderRadius: 16,
  },
  subjectIconContainer: {
    marginRight: 16,
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectContent: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subjectMeta: {
    fontSize: 13,
    color: '#666666',
  },
  subjectStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  subjectArrowContainer: {
    marginLeft: 12,
  },
  subjectArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatItem: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  chatItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#6803FF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatGradient: {
    borderRadius: 16,
  },
  chatAvatarContainer: {
    marginRight: 16,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
    color: '#666666',
  },
  chatMeta: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 2,
  },
  chatCreator: {
    fontSize: 12,
    color: '#6803FF',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#6803FF',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    color: '#1A1A1A',
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  createButton: {
    backgroundColor: '#6803FF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    width: 120,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 8,
  },
  clearButton: {
    padding: 4,
  },
});