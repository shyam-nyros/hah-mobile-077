import React, {useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import tw from 'twrnc';

const CustomVideoPlayer = ({uri}) => {
  const [paused, setPaused] = useState(true);

  const handlePlayPause = () => {
    setPaused(!paused);
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
        />
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
});

export default CustomVideoPlayer;
