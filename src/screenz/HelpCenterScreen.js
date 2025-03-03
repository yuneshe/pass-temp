import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import SafeScreen from '../components/SafeScreen';

const HelpSection = ({ section, onPress, theme }) => {
  const { t } = useTranslation();
  const items = t(`helpCenter.sections.${section}.items`, { returnObjects: true });
  
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
        {t(`helpCenter.sections.${section}.title`)}
      </Text>
      {Object.keys(items).map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.helpItem, { backgroundColor: theme.surface }]}
          onPress={() => onPress(section, item)}
        >
          <View style={styles.helpItemContent}>
            <Text style={[styles.helpItemTitle, { color: theme.textPrimary }]}>
              {items[item].title}
            </Text>
            <Text
              style={[styles.helpItemPreview, { color: theme.textSecondary }]}
              numberOfLines={2}
            >
              {items[item].content}
            </Text>
          </View>
          <Icon name="chevron-forward" size={24} color={theme.primary} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const HelpDetailModal = ({ visible, section, item, onClose, theme }) => {
  const { t } = useTranslation();
  const translateY = useRef(new Animated.Value(1000)).current;
  const { height: windowHeight } = Dimensions.get('window');
  const items = t(`helpCenter.sections.${section}.items`, { returnObjects: true });

  React.useEffect(() => {
    const animation = Animated.spring(translateY, {
      toValue: visible ? 0 : windowHeight,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    });
    
    animation.start();
    
    return () => animation.stop();
  }, [visible, windowHeight]);

  if (!visible) return null;

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@pass-education.com');
  };

  return (
    <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <Animated.View
        style={[
          styles.modalContent,
          {
            backgroundColor: theme.background,
            transform: [{ translateY }],
            maxHeight: windowHeight * 0.8,
          },
        ]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="close" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
            {items[item]?.title}
          </Text>
        </View>
        <ScrollView 
          style={styles.modalBody}
          bounces={false}
          showsVerticalScrollIndicator={true}
        >
          <Text style={[styles.modalText, { color: theme.textPrimary }]}>
            {items[item]?.content}
          </Text>
          {section === 'support' && item === 'contact' && (
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: theme.primary }]}
              onPress={handleContactSupport}
            >
              <Icon name="mail" size={20} color="#FFF" />
              <Text style={styles.contactButtonText}>
                {t('helpCenter.buttons.contactSupport')}
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.modalBottomPadding} />
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const HELP_SECTIONS = ['gettingStarted', 'materials', 'downloads', 'payments', 'support'];

export default function HelpCenterScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const scrollViewRef = useRef(null);

  const handleItemPress = (section, item) => {
    setSelectedSection(section);
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleClearSearch = () => setSearchQuery('');

  const handleScrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const filteredSections = searchQuery
    ? HELP_SECTIONS.filter((section) => {
        const items = t(`helpCenter.sections.${section}.items`, { returnObjects: true });
        return Object.values(items).some(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : HELP_SECTIONS;

  return (
    <SafeScreen style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          {t('helpCenter.header.title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {t('helpCenter.header.subtitle')}
        </Text>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
          <Icon name="search-outline" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder={t('helpCenter.search.placeholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Icon name="close-circle-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.length === 0 ? (
          <Text style={[styles.noResults, { color: theme.textSecondary }]}>
            {t('helpCenter.search.noResults')}
          </Text>
        ) : (
          filteredSections.map((section) => (
            <HelpSection
              key={section}
              section={section}
              onPress={handleItemPress}
              theme={theme}
            />
          ))
        )}
      </ScrollView>

      {!searchQuery && (
        <TouchableOpacity
          style={[styles.backToTop, { backgroundColor: theme.primary }]}
          onPress={handleScrollToTop}
        >
          <Icon name="arrow-up" size={24} color="#FFF" />
        </TouchableOpacity>
      )}

      <HelpDetailModal
        visible={modalVisible}
        section={selectedSection}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
        theme={theme}
      />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  helpItemPreview: {
    fontSize: 14,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalBody: {
    padding: 16,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  contactButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backToTop: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  modalBottomPadding: {
    height: 20,
  },
});
