import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';
import Text from '../components/Text';
import SafeScreen from '../components/SafeScreen';
import { useTheme } from '../context/ThemeContext';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function VideoPlayerScreen({ route, navigation }) {
  const { uri, title } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#000000');
    }

    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => {
      StatusBar.setBarStyle('default');
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor('transparent');
      }
      subscription.remove();
      // Reset orientation when unmounting
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, []);

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleBack = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    // Reset orientation before going back
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    navigation.goBack();
  };

  const toggleFullscreen = async () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    if (newFullscreenState) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    }
  };

  const handleSpeedChange = async (speed) => {
    if (videoRef.current) {
      await videoRef.current.setRateAsync(speed, true);
      setPlaybackSpeed(speed);
      setShowSpeedModal(false);
    }
  };

  const formatTime = (milliseconds) => {
    if (!milliseconds) return '00:00';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleControls = () => {
    setIsControlsVisible(!isControlsVisible);
    setShowSpeedModal(false);
  };

  const isLandscape = dimensions.width > dimensions.height;
  const videoHeight = isLandscape ? dimensions.height : (dimensions.width * 9) / 16;
  const videoWidth = isLandscape ? dimensions.width : dimensions.width;

  return (
    <SafeScreen style={styles.container}>
      <View style={[
        styles.videoContainer,
        {
          height: videoHeight,
          width: videoWidth,
        }
      ]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.videoWrapper,
            {
              height: videoHeight,
              width: videoWidth,
            }
          ]}
          onPress={toggleControls}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri }}
            useNativeControls={false}
            resizeMode="contain"
            isLooping={false}
            onPlaybackStatusUpdate={setStatus}
            shouldPlay={true}
          />

          {isControlsVisible && (
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent', 'transparent', 'rgba(0,0,0,0.7)']}
              style={styles.controlsOverlay}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Icon name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>
                  {title}
                </Text>
                <View style={styles.placeholder} />
              </View>

              {/* Center Controls */}
              <View style={styles.centerControls}>
                <TouchableOpacity
                  style={styles.playPauseButton}
                  onPress={togglePlayPause}
                >
                  <Icon
                    name={status.isPlaying ? 'pause' : 'play'}
                    size={40}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>

              {/* Bottom Controls */}
              <View style={styles.bottomControls}>
                <View style={styles.progressContainer}>
                  <Text style={styles.timeText}>
                    {formatTime(status.positionMillis)}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progress,
                        {
                          width: `${status.positionMillis && status.durationMillis
                            ? (status.positionMillis / status.durationMillis) * 100
                            : 0}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.timeText}>
                    {formatTime(status.durationMillis)}
                  </Text>
                </View>

                {/* Additional Controls */}
                <View style={styles.additionalControls}>
                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={() => setShowSpeedModal(true)}
                  >
                    <Text style={styles.speedText}>{playbackSpeed}x</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleFullscreen}
                  >
                    <Icon
                      name={isFullscreen ? 'contract' : 'expand'}
                      size={24}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          )}

          {/* Speed Selection Modal */}
          <Modal
            visible={showSpeedModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSpeedModal(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowSpeedModal(false)}
            >
              <View style={styles.speedModal}>
                <ScrollView>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <TouchableOpacity
                      key={speed}
                      style={[
                        styles.speedOption,
                        speed === playbackSpeed && styles.selectedSpeed,
                      ]}
                      onPress={() => handleSpeedChange(speed)}
                    >
                      <Text style={[
                        styles.speedOptionText,
                        speed === playbackSpeed && styles.selectedSpeedText,
                      ]}>
                        {speed}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoContainer: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoWrapper: {
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 40 : 10,
  },
  backButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  centerControls: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    padding: 16,
  },
  bottomControls: {
    marginBottom: Platform.OS === 'ios' ? 40 : 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 8,
    borderRadius: 2,
  },
  progress: {
    height: '100%',
    backgroundColor: '#6803FF',
    borderRadius: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  controlButton: {
    padding: 8,
    marginLeft: 16,
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    width: 150,
    maxHeight: 200,
  },
  speedOption: {
    padding: 12,
    alignItems: 'center',
  },
  selectedSpeed: {
    backgroundColor: '#6803FF20',
  },
  speedOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  selectedSpeedText: {
    color: '#6803FF',
    fontWeight: '600',
  },
});
