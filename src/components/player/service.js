import TrackPlayer, {Event} from 'react-native-track-player';
import {AppKilledPlaybackBehavior} from 'react-native-track-player';

module.exports = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext(),
  );
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious(),
  );
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());

  // Handle playback state changes
  TrackPlayer.addEventListener(Event.PlaybackState, event => {
    console.log('Playback state changed:', event);
  });

  // Handle track changes
  TrackPlayer.addEventListener(Event.PlaybackTrackChanged, event => {
    console.log('Track changed:', event);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, event => {
    console.log('Queue ended:', event);
  });

  TrackPlayer.updateOptions({
    android: {
      // This is the default behavior
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
  });
};
