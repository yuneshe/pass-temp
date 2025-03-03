import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import SafeScreen from '../components/SafeScreen';
import { AnimatedButton } from '../components/AnimatedButton';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import api from '../config/api';

const CreateChatSubjectScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { theme } = useSettings();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await api.chat.createSubject({
        name: name.trim(),
        category_id: 1, // TODO: Allow selecting category
      });

      navigation.goBack();
    } catch (err) {
      console.error('Error creating subject:', err);
      setError(err.message || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeScreen style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {t('chat:subjectName')}
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder={t('chat:subjectNamePlaceholder')}
            placeholderTextColor={theme.colors.secondaryText}
          />
        </View>

        {error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </ScrollView>

      <AnimatedButton
        title={loading ? t('common:creating') : t('chat:createSubject')}
        onPress={handleCreate}
        disabled={!name.trim() || loading}
        style={styles.createButton}
        variant="primary"
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
            style={styles.loadingIndicator}
          />
        )}
      </AnimatedButton>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  createButton: {
    margin: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
});

export default CreateChatSubjectScreen;
