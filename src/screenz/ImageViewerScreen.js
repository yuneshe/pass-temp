import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function ImageViewerScreen({ route, navigation }) {
  const { imageUrl } = route.params;
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />
      
      {/* Close Button */}
      <Pressable
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="close" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Image with Zoom */}
      <ImageZoom
        cropWidth={width}
        cropHeight={height}
        imageWidth={width}
        imageHeight={height}
        enableSwipeDown={true}
        onSwipeDown={() => navigation.goBack()}
        style={styles.imageContainer}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
          onLoadStart={() => setLoading(true)}
          onLoad={() => setLoading(false)}
          onError={() => {
            console.error('Failed to load image:', imageUrl);
            setError(true);
            setLoading(false);
          }}
        />
      </ImageZoom>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      {/* Error Icon */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#FFFFFF" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  imageContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  image: {
    width: width,
    height: height,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
});
