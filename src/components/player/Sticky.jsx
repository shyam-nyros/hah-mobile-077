import React, {useState, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {usePlaybackState, useProgress} from 'react-native-track-player';
import MiniPlayer from './MiniPlayer';
import {View} from 'react-native';
import {
  fetchTrackInfo,
  togglePlayback,
  handleSeek,
  seekForward,
  seekBackward,
  seekToZero,
} from './Controls';
import {useDispatch, useSelector} from 'react-redux';

const Sticky = () => {
  const dispatch = useDispatch();
  const {isPlaying, currentTrackInfo} = useSelector(state => state.auth);
  const navigation = useNavigation();
  const playbackState = usePlaybackState();
  const {position, duration} = useProgress();

  const [currentTrack, setCurrentTrack] = useState(currentTrackInfo);

  // useEffect(() => {
  //   setTimeout(async () => {
  //     const trackInfo = await fetchTrackInfo();
  //     setCurrentTrack(trackInfo);
  //     setTrackTitle(trackInfo.title);
  //     setTrackArtist(trackInfo.artist);
  //     setTrackCover(trackInfo.cover);
  //   }, 1000);
  // }, []);

  const expandPlayer = () => {
    navigation.navigate('PlayerScreen', {track: currentTrack});
  };

  return (
    <View>
      <MiniPlayer
        expandPlayer={expandPlayer}
        duration={duration}
        position={position}
        handleSeek={handleSeek}
        seekBackward={() => seekBackward(position)}
        seekForward={() => seekForward(position, duration)}
        togglePlayback={() => togglePlayback(playbackState, dispatch)}
        isPlaying={isPlaying}
        seekToZero={seekToZero}
      />
    </View>
  );
};

export default Sticky;
