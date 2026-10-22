import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Video from 'react-native-video';
import tw from 'twrnc';
import LoadingSpinner from '../../components/LoadingSpinner';

const CustomVideoPlayer = ({uri}) => {
  const [paused, setPaused] = useState(true);
  const [buffering, setBuffering] = useState(false);

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  const onBuffer = isBuffering => {
    setBuffering(isBuffering.isBuffering);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.videoContainer}>
        <Video
          source={{uri}} // Replace with your video URL or local path
          style={styles.video}
          controls={true} // Show media controls like play, pause, etc.
          paused={paused} // Control playback with the paused state
          resizeMode="cover" // Aspect ratio to cover the entire video area
          onBuffer={onBuffer} // Handle buffering state changes
        />

        {buffering && (
          <View style={styles.bufferingContainer}>
            <LoadingSpinner size={'small'} color={'white'} />
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
    height: '100%', // Set the height of the video
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
