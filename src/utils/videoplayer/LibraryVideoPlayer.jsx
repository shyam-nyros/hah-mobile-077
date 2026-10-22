import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import VideoPlayer from 'react-native-video-controls';

const LibraryVideoPlayer = ({uri, playStatus}) => {
  const [paused, setPaused] = useState(playStatus);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const handlePlayPause = () => {
    setPaused(!paused);
  };

  // Initially when the image cover is clicked play the video
  useEffect(() => {
    if (playStatus) {
      // Play the video
      setPaused(!paused);
    }
  }, [uri]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePlayPause} style={styles.videoContainer}>
        <VideoPlayer
          source={{uri}}
          style={styles.video}
          controlTimeout={3000}
          tapAnywhereToPause={true}
          showOnStart={true}
          disableVolume={true}
          disableBack={true}
          fullscreen={fullScreenMode}
          onEnterFullscreen={() => {
            setFullScreenMode(true);
          }}
          onExitFullscreen={() => {
            setFullScreenMode(false);
          }}
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

export default LibraryVideoPlayer;
