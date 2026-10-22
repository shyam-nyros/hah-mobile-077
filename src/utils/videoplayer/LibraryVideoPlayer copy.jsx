import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Video from 'react-native-video';
import tw from 'twrnc';
import VideoPlayer from 'react-native-video-controls';

const LibraryVideoPlayer = ({uri, playStatus}) => {
  const [paused, setPaused] = useState(playStatus);

  const handlePlayPause = () => {
    setPaused(!paused);
  };

  //initially when the image cover is clicked play the video
  useEffect(() => {
    if (playStatus) {
      //play the video
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
        />
      </TouchableOpacity>
    </View>
    // <View style={styles.container}>
    //   <TouchableOpacity onPress={handlePlayPause} style={styles.videoContainer}>
    //     <Video
    //       source={{uri}} // Replace with your video URL or local path
    //       style={styles.video}
    //       controls={true} // Show media controls like play, pause, etc.
    //       paused={paused} // Control playback with the paused state
    //       resizeMode="contain" // Aspect ratio to cover the entire video area
    //     />
    //   </TouchableOpacity>
    // </View>
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
