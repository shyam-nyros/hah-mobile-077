import React, {useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Video from 'react-native-video';
import tw from 'twrnc';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomVideoPlayer = ({uri}) => {
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);

  // Create a ref for the Video component
  const videoRef = useRef(null);

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const onBuffer = (meta) => {
    setBuffering(meta.isBuffering);
  };

  const onError = (error) => {
    console.error('Video Error:', error);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.videoContainer}>
        <Video
          source={{uri}}
          ref={videoRef}
          style={styles.video}
          controls
          paused={paused}
          resizeMode="cover"
          onBuffer={onBuffer}
          onError={onError}
        />

        {buffering && (
          <View style={styles.bufferingContainer}>
            <LoadingSpinner size="small" color="white" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomVideoPlayer;
