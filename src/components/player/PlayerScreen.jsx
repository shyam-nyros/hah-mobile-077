import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {usePlaybackState, useProgress} from 'react-native-track-player';
import MiniPlayer from './MiniPlayer';
import {Button, View, SafeAreaView} from 'react-native';
import {
  setupPlayer,
  fetchTrackInfo,
  togglePlayback,
  handleSeek,
  seekForward,
  seekBackward,
  resetPlayer,
  seekToZero,
} from './Controls';

import MainPlayer from './MainPlayer';
import {useDispatch, useSelector} from 'react-redux';
import {
  setCurrentTrackInfo,
  setHideStickyPlayer,
  setShowStickyPlayer,
} from '../../features/auth/authSlice';

const PlayerScreen = ({route}) => {
  const {track} = route.params;
  

  const {isPlaying, currentTrackInfo} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const playbackState = usePlaybackState();
  const {position, duration} = useProgress();

  useEffect(() => {
    setupPlayer(track);
    dispatch(
      setCurrentTrackInfo({
        id: track?._id,
        title: track.title,
        aigenerated: track?.aigenerated,
        ai_cover_image: track?.ai_cover_image,
        artist: track.artist,
        cover: track.cover,
        url: track.url,
      }),
    );
  }, [track]);

  useEffect(() => {
    dispatch(setHideStickyPlayer());
    return () => {
      // show mini player when the main player unmounted
      dispatch(setShowStickyPlayer());
    };
  }, []);

  const getTrack = () => {};
  return (
    <SafeAreaView>
      <View>
        {/* <Button title="GET TRACK" onPress={getTrack} /> */}
        <MainPlayer
          duration={duration}
          position={position}
          handleSeek={handleSeek}
          seekBackward={() => seekBackward(position)}
          seekForward={() => seekForward(position, duration)}
          togglePlayback={() => togglePlayback(playbackState, dispatch)}
          reset={resetPlayer}
          seekToZero={seekToZero}
        />
      </View>
    </SafeAreaView>
  );
};

export default PlayerScreen;
