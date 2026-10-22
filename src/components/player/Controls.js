import TrackPlayer, {Capability, State} from 'react-native-track-player';
import {setPlayerPause, setPlayerStart} from '../../features/auth/authSlice';

export const setupPlayer = async track => {
  try {
    if (State.None === 'none') {
      await TrackPlayer.add({
        _id: track._id,
        url: track.url,
        cover: track.cover,
        title: track.title,
        artist: track.artist,
      });
    }
    const res = await fetchTrackInfo();

    // to show player in notification bar
    // await TrackPlayer.updateOptions({
    //   capabilities: [
    //     Capability.Play,
    //     Capability.Pause,
    //     Capability.SkipToNext,
    //     Capability.SkipToPrevious,
    //   ],
    // });

    if (res._id === track._id) {
      await TrackPlayer.add({
        _id: track._id,
        url: track.url,
        cover: track.cover,
        title: track.title,
        artist: track.artist,
      });
    } else {
      await TrackPlayer.load({
        _id: track._id,
        url: track.url,
        cover: track.cover,
        title: track.title,
        artist: track.artist,
      });
    }
  } catch (error) {}
};

export const fetchTrackInfo = async () => {
  const track = await TrackPlayer.getActiveTrack();

  return track;
};

export const togglePlayback = async (playbackState, dispatch) => {
  // export const togglePlayback = async (playbackState, setIsPlaying) => {

  if (playbackState.state === State.Playing) {
    await TrackPlayer.pause();
    dispatch(setPlayerPause());
  } else {
    await TrackPlayer.play();
    dispatch(setPlayerStart());
  }
};

export const handleSeek = async value => {
  await TrackPlayer.seekTo(value);
};

export const seekForward = async (position, duration) => {
  const newPosition = position + 30;
  if (newPosition < duration) {
    await TrackPlayer.seekTo(newPosition);
  } else {
    await TrackPlayer.seekTo(duration);
  }
};

export const resetPlayer = async () => {
  await TrackPlayer.reset();
};

export const seekBackward = async position => {
  const newPosition = position - 30;
  if (newPosition > 0) {
    await TrackPlayer.seekTo(newPosition);
  } else {
    await TrackPlayer.seekTo(0);
  }
};

export const seekToZero = async position => {
  await TrackPlayer.seekTo(0);
};
