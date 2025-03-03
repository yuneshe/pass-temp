import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatRoomScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { chat } = route.params;
  const flatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimer = useRef(null);

  // Audio playback state
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});

  useEffect(() => {
    // Get current user on mount
    const getCurrentUser = async () => {
      try {
        const user = await api.auth.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Error getting current user:', err);
      }
    };
    getCurrentUser();

    // Fetch messages when component mounts
    fetchMessages();

    // Hide navigation header
    navigation.setOptions({
      headerShown: false,
    });

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (recording) {
        recording.unloadAsync();
      }
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [chat?.id]);

  const fetchMessages = async () => {
    if (!chat?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const result = await api.chat.getMessages(chat.id);
      
      // Handle both array and object response formats
      const messages = Array.isArray(result) ? result : 
                      result?.success && Array.isArray(result.data) ? result.data : 
                      null;
      
      if (messages) {
        setMessages(messages);
        
        // Update current user info if available
        if (result?.current_user) {
          setCurrentUser(result.current_user);
        }
        
        // Scroll to bottom after messages load
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      } else {
        throw new Error(t('chat.fetchError'));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message || t('chat.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('chat.micPermissionDenied'));
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);

      // Start duration timer
      let duration = 0;
      recordingTimer.current = setInterval(() => {
        duration += 1;
        setRecordingDuration(duration);
        if (duration >= 300) { // 5 minutes max
          stopRecording();
        }
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording:', err);
      Alert.alert(t('common.error'), t('chat.recordingError'));
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      clearInterval(recordingTimer.current);
      const uri = recording.getURI();
      const duration = recordingDuration;
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      
      // Send voice note
      await handleSendMessage(null, {
        uri,
        type: 'voice',
        duration
      });

    } catch (err) {
      console.error('Failed to stop recording:', err);
      Alert.alert(t('common.error'), t('chat.recordingError'));
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        await handleSendMessage(null, {
          uri: asset.uri,
          type: 'image'
        });
      }
    } catch (err) {
      console.error('Error picking image:', err);
      Alert.alert(t('common.error'), t('chat.imagePickerError'));
    }
  };

  const handleSendMessage = async (text, media = null) => {
    if (!text && !media) return;
    
    try {
      setIsSending(true);

      // For text messages
      if (text) {
        const payload = { content: text.trim() };
        const result = await api.chat.sendMessage(chat.id, payload);
        
        if (result?.success) {
          setMessages(prev => [...prev, result.data]);
          setNewMessage('');
          flatListRef.current?.scrollToEnd({ animated: true });
        } else {
          throw new Error(result?.message || t('chat.sendError'));
        }
        return;
      }

      // For media messages
      if (media) {
        const formData = new FormData();
        const fileName = media.uri.split('/').pop();
        const mimeType = media.type === 'image' 
          ? 'image/jpeg'
          : 'audio/m4a';

        // Create file object for media
        const fileObject = {
          uri: Platform.OS === 'android' ? media.uri : media.uri.replace('file://', ''),
          name: fileName,
          type: mimeType
        };

        formData.append('media', fileObject);
        formData.append('media_type', media.type);
        formData.append('content', ' '); // Add space as content for media messages
        
        if (media.type === 'voice') {
          formData.append('media_duration', media.duration?.toString());
        }

        const baseUrl = await api.getApiUrl();
        const token = await AsyncStorage.getItem('@auth_token');
        
        // Use fetch directly for media uploads
        const response = await fetch(`${baseUrl}/chat/subjects/chats/${chat.id}/messages`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            // Let the browser set the Content-Type with boundary for FormData
          },
          body: formData
        });

        const result = await response.json();
        
        if (result?.success) {
          setMessages(prev => [...prev, result.data]);
          setNewMessage('');
          flatListRef.current?.scrollToEnd({ animated: true });
        } else {
          throw new Error(result?.message || t('chat.sendError'));
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      Alert.alert(t('common.error'), t('chat.sendError'));
    } finally {
      setIsSending(false);
    }
  };

  const playVoiceNote = async (messageId, url) => {
    try {
      // Stop any currently playing audio
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setIsPlaying({ ...isPlaying, [messageId]: true });
      
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setIsPlaying({ ...isPlaying, [messageId]: false });
        }
      });
    } catch (err) {
      console.error('Error playing voice note:', err);
      Alert.alert(t('common.error'), t('chat.audioPlaybackError'));
    }
  };

  const renderMessage = ({ item }) => {
    const messageUser = item.user;
    const isOwnMessage = messageUser?.id === currentUser?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {!isOwnMessage && (
          <Text style={styles.messageSender}>{messageUser?.name || t('chat.unknownUser')}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
          { backgroundColor: isOwnMessage ? '#6803FF' : '#F0F0F0' }
        ]}>
          {item.media_type === 'image' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('ImageViewer', { imageUrl: item.media_url })}
            >
              <Image
                source={{ uri: item.media_url }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {item.media_type === 'voice' && (
            <TouchableOpacity 
              style={styles.voiceNoteContainer}
              onPress={() => playVoiceNote(item.id, item.media_url)}
            >
              <Ionicons 
                name={isPlaying[item.id] ? 'pause' : 'play'} 
                size={24} 
                color={isOwnMessage ? '#FFF' : '#6803FF'} 
              />
              <View style={styles.voiceNoteDuration}>
                <Text style={[
                  styles.voiceNoteText,
                  { color: isOwnMessage ? '#FFF' : '#000' }
                ]}>
                  {Math.round(item.media_duration)}s
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {item.content && (
            <Text style={[
              styles.messageText,
              { color: isOwnMessage ? '#FFFFFF' : '#000000' }
            ]}>
              {item.content}
            </Text>
          )}

          <Text style={[
            styles.messageTime,
            { color: isOwnMessage ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -300}
      enabled
    >
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#6803FF', '#4A02B2']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{chat?.title || ''}</Text>
        </LinearGradient>

        {loading ? (
          <ActivityIndicator size="large" color="#6803FF" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
              <Text style={styles.retryText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
        )}

        <BlurView intensity={100} tint="light" style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={() => setShowMediaOptions(true)}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6803FF" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={t('chat.typeMessage')}
            placeholderTextColor="#666"
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            editable={!isSending && !isRecording}
          />

          {!newMessage.trim() ? (
            <TouchableOpacity
              style={[styles.mediaButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? 'stop-circle' : 'mic'} 
                size={24} 
                color={isRecording ? '#FF3B30' : '#6803FF'} 
              />
              {isRecording && (
                <Text style={styles.recordingDuration}>
                  {recordingDuration}s
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
              onPress={() => handleSendMessage(newMessage)}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name="send" size={24} color="#FFF" />
              )}
            </TouchableOpacity>
          )}
        </BlurView>

        <Modal
          visible={showMediaOptions}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMediaOptions(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMediaOptions(false)}
          >
            <View style={styles.mediaOptionsContainer}>
              <TouchableOpacity
                style={styles.mediaOption}
                onPress={() => {
                  setShowMediaOptions(false);
                  pickImage();
                }}
              >
                <Ionicons name="image" size={24} color="#6803FF" />
                <Text style={styles.mediaOptionText}>{t('chat.sendImage')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: Platform.OS === 'ios' ? 90 : 60,
    paddingTop: Platform.OS === 'ios' ? 45 : 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  ownMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageSender: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#6803FF',
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  voiceNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  voiceNoteDuration: {
    marginLeft: 8,
  },
  voiceNoteText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    borderRadius: 20,
    backgroundColor: '#FFF',
    color: '#000',
  },
  mediaButton: {
    padding: 8,
    borderRadius: 20,
  },
  recordingButton: {
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  recordingDuration: {
    position: 'absolute',
    bottom: -16,
    right: 0,
    fontSize: 12,
    color: '#FF3B30',
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#6803FF',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  mediaOptionsContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  mediaOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  mediaOptionText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#000',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#6803FF',
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
  },
});

export default ChatRoomScreen;
