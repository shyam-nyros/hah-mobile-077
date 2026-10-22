import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Text,
} from 'react-native';
import Slider from '@react-native-community/slider';
import tw from 'twrnc';
import Video from 'react-native-video';
import videoicon from '../../../assets/images/blueplayicon.png';

const {width, height} = Dimensions.get('window');

const FullScreenMedia = ({visible, mediaUrl, mediaType, onClose}) => {
  
  
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [seeking, setSeeking] = useState(false);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const onLoadStart = () => {
    setLoading(true);
  };

  const onLoad = data => {
    setLoading(false);
    setDuration(data.duration);
  };

  const onProgress = data => {
    if (!seeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const onError = error => {
    console.error('Media loading error:', error);
    setLoading(false);
  };

  const togglePlayPause = () => {
    setPaused(!paused);
    showControlsTemporarily();
  };

  const seekTo = time => {
    if (videoRef.current) {
      videoRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const seekForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    seekTo(newTime);
    showControlsTemporarily();
  };

  const seekBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    seekTo(newTime);
    showControlsTemporarily();
  };

  const onSliderValueChange = value => {
    setSeeking(true);
    setCurrentTime(value);
  };

  const onSlidingComplete = value => {
    setSeeking(false);
    seekTo(value);
  };

  const formatTime = timeSeconds => {
    const minutes = Math.floor(timeSeconds / 60);
    const seconds = Math.floor(timeSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleVideoPress = () => {
    if (showControls) {
      setShowControls(false);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    } else {
      showControlsTemporarily();
    }
  };

  useEffect(() => {
    if (mediaType === 'video' && visible) {
      showControlsTemporarily();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [visible, mediaType]);

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        {/* Header - Always visible */}
        <View
          style={[
            styles.header,
            showControls || mediaType === 'image'
              ? styles.headerVisible
              : styles.headerHidden,
          ]}>
          <TouchableOpacity onPress={onClose} style={tw`top-15 py-2 px-2`}>
            <Image
              source={require('../../../assets/images/chevronlefticon.png')}
              style={tw`w-[33px] h-[33px]`}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.mediaContainer}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#00B4D8"
              style={styles.loader}
            />
          )}

          {mediaType === 'image' ? (
            <Image
              source={{uri: mediaUrl}}
              style={styles.fullImage}
              resizeMode="contain"
              onLoadStart={onLoadStart}
              onLoad={onLoad}
              onError={onError}
            />
          ) : mediaType === 'video' ? (
            <>
              <TouchableOpacity
                style={styles.videoTouchArea}
                onPress={handleVideoPress}
                activeOpacity={1}>
                <Video
                  ref={videoRef}
                  // source={{
                  //   uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  // }}
                  source={{uri: mediaUrl}}
                  style={styles.fullVideo}
                  resizeMode="contain"
                  controls={false}
                  paused={paused}
                  onLoadStart={onLoadStart}
                  onLoad={onLoad}
                  onProgress={onProgress}
                  onError={onError}
                  repeat={false}
                />
              </TouchableOpacity>

              {/* Video Controls Overlay */}
              {showControls && (
                <View style={styles.controlsOverlay}>
                  {/* Center Play/Pause Button */}
                  <View style={styles.centerControls}>
                    <TouchableOpacity
                      onPress={seekBackward}
                      style={styles.seekButton}>
                      <Image
                        source={require('../../../assets/images/skipbackicon.png')}
                        style={styles.seekIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={togglePlayPause}
                      style={styles.playPauseButton}>
                      <Image
                        source={
                          paused
                            ? require('../../../assets/images/playbutton.png')
                            : require('../../../assets/images/pauseicon.png')
                        }
                        style={styles.playPauseIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={seekForward}
                      style={styles.seekButton}>
                      <Image
                        source={require('../../../assets/images/skipforwardicon.png')}
                        style={styles.seekIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Controls */}
                  <View style={styles.bottomControls}>
                    <View style={styles.progressContainer}>
                      <Text style={styles.timeText}>
                        {formatTime(currentTime)}
                      </Text>

                      <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={currentTime}
                        onValueChange={onSliderValueChange}
                        onSlidingComplete={onSlidingComplete}
                        minimumTrackTintColor="#00B4D8"
                        maximumTrackTintColor="rgba(255,255,255,0.3)"
                        thumbStyle={styles.sliderThumb}
                        trackStyle={styles.sliderTrack}
                      />

                      <Text style={styles.timeText}>
                        {formatTime(duration)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          ) : null}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    height: 60,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerVisible: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerHidden: {
    backgroundColor: 'transparent',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  fullImage: {
    width: width,
    height: height,
  },
  fullVideo: {
    width: width,
    height: height,
  },
  videoTouchArea: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -15,
    zIndex: 20,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centerControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    width: 40,
    height: 40,
  },
  seekButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekIcon: {
    width: 30,
    height: 30,
  },
  bottomControls: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderThumb: {
    width: 15,
    height: 15,
    backgroundColor: '#00B4D8',
  },
  sliderTrack: {
    height: 3,
    borderRadius: 1.5,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 45,
    textAlign: 'center',
  },
});

export default FullScreenMedia;
