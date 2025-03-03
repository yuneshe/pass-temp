import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import SafeScreen from '../components/SafeScreen';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';

const MessageItem = ({ message, isLastMessage }) => {
  const { theme } = useSettings();
  const isCurrentUser = message.userId === 'currentUser'; // Replace with actual user check

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        !isLastMessage && styles.messageSpacing,
      ]}
    >
      {!isCurrentUser && (
        <Text style={[styles.userName, { color: theme.colors.primary }]}>
          {message.userName}
        </Text>
      )}
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isCurrentUser ? theme.colors.primary : theme.colors.card,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isCurrentUser ? '#FFFFFF' : theme.colors.text },
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.messageTime,
            { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : theme.colors.secondaryText },
          ]}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};

const ChatDiscussionScreen = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const { theme } = useSettings();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // Temporary mock data - replace with API call
  useEffect(() => {
    const mockMessages = [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        text: 'Has anyone implemented push notifications in their React Native app?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        userId: 'currentUser',
        userName: 'You',
        text: 'Yes, I used Firebase Cloud Messaging. It works great!',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: '3',
        userId: 'user2',
        userName: 'Alice Smith',
        text: 'I prefer OneSignal, it has a better dashboard and easier setup.',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
    ];

    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        userId: 'currentUser',
        userName: 'You',
        text: inputText.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setInputText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText]);

  if (loading) {
    return (
      <SafeScreen style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item, index }) => (
            <MessageItem
              message={item}
              isLastMessage={index === messages.length - 1}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.secondaryText }]}>
                {t('chat:noMessages')}
              </Text>
            </View>
          }
        />

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder={t('chat:typingPlaceholder')}
            placeholderTextColor={theme.colors.secondaryText}
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            onPress={handleSend}
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '85%',
    marginBottom: 4,
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageSpacing: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageBubble: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChatDiscussionScreen;
