import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const SearchBar = ({
  placeholder,
  value,
  onChangeText,
  onSubmit,
  onClear,
  style,
  autoFocus = false,
}) => {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    if (onChangeText) onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: focused ? colors.primary : colors.primary + '40',
        },
        style,
      ]}
    >
      <Icon
        name="search-outline"
        size={20}
        color={focused ? colors.primary : colors.text}
        style={styles.searchIcon}
      />
      
      <TextInput
        style={[
          styles.input,
          { color: colors.text },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.text + '80'}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={({ nativeEvent: { text } }) => onSubmit?.(text)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {value ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
        >
          <Icon
            name="close-circle"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default SearchBar;
