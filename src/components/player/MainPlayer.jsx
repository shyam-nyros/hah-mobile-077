import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Button,
} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {useDispatch, useSelector} from 'react-redux';
import moment from 'moment';
import {login, setShowStickyPlayer} from '../../features/auth/authSlice';

const MainPlayer = ({
  duration,
  position,
  handleSeek,
  seekBackward,
  seekForward,
  togglePlayback,
  seekToZero,
}) => {
  const {isPlaying, currentTrackInfo} = useSelector(state => state.auth);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Format time using moment.js
  // const formatTime = seconds => {
  //   if (seconds < 0) seconds = 0; // Prevent negative time
  //   return moment.utc(seconds * 1000).format('mm:ss');
  // };
  const formatTime = seconds => {
    if (seconds < 0) seconds = 0;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Stop the song when it ends
  useEffect(() => {
    if (position >= duration) {
      trackEnded();
    }
  }, [position, duration]);

  const minimizePlayer = () => {
    dispatch(setShowStickyPlayer());
    navigation.goBack();
  };

  const trackEnded = () => {
    seekToZero();
    togglePlayback();
  };

  return (
    <ScrollView style={tw`h-full bg-white`}>
      {/* Header */}
      <View style={tw`mx-2 py-4`}>
        <View style={tw`flex-row flex-1 justify-between`}>
          <TouchableOpacity onPress={minimizePlayer}>
            <Image
              source={require('../../assets/images/backnavicon.png')}
              style={[tw`w-9 h-9 `, {transform: [{rotate: '-90deg'}]}]}
            />
          </TouchableOpacity>
          <Text
            style={tw`text-[#040641] text-[18px] mr-4 font-semibold text-center`}>
            Now Playing
          </Text>
          <Image
            source={require('../../assets/images/backnavicon.png')}
            style={tw`w-1 h-1 `}
          />
        </View>
      </View>

      {/* Body */}
      <View style={tw`mx-4 mt-6`}>
        {currentTrackInfo && (
          <>
            {/* cover image for AI generated */}
            {currentTrackInfo?.aigenerated && (
              <Image
                source={
                  currentTrackInfo?.ai_cover_image
                    ? {uri: currentTrackInfo.ai_cover_image}
                    : require('../../assets/images/podcastplaceholder.png')
                }
                style={[
                  tw`w-full h-80 rounded-[20px]`,
                  {
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.9,
                    shadowRadius: 6,
                  },
                ]}
              />
            )}
            {/* cover image for not AI generated */}
            {!currentTrackInfo?.aigenerated && (
              <Image
                source={
                  currentTrackInfo?.cover
                    ? {uri: currentTrackInfo.cover}
                    : require('../../assets/images/podcastplaceholder.png')
                }
                style={[
                  tw`w-full h-80 rounded-[20px]`,
                  {
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.9,
                    shadowRadius: 6,
                  },
                ]}
              />
            )}
          </>
        )}
        <View style={tw`mt-4 justify-center items-center`}>
          <View
            style={tw`bg-[#040641] flex-1 px-2 bg-opacity-20 gap-2 justify-center items-center flex-row rounded-full py-2`}>
            {/* <Image
              source={require('../../assets/images/leader1.png')}
              style={tw`w-6 h-6 rounded-full`}
            /> */}
            <Image
              source={
                currentTrackInfo?.artist?.profile_image
                  ? {uri: currentTrackInfo?.artist?.profile_image}
                  : require('../../assets/images/leader1.png')
              }
              style={tw`w-6 h-6 rounded-full`}
            />
            <Text style={tw`text-[#040641] text-[16px]`}>
              {currentTrackInfo?.artist.first_name || 'Unknown Artist'}
            </Text>
          </View>
          <View style={tw`mt-2`}>
            <Text
              style={tw`text-[#040641] text-center text-[18px] font-semibold`}>
              {currentTrackInfo?.title || 'Unknown Title'}
            </Text>
          </View>
        </View>

        <View style={tw`flex-2 justify-center items-center bg-white`}>
          <Slider
            style={{width: '100%', height: 10, marginTop: 20}}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#0077B6"
            maximumTrackTintColor="rgba(0, 119, 182, 0.6)"
            thumbTintColor="#0077B6"
            onSlidingComplete={handleSeek}
          />
          <View style={tw`flex-row w-[90%] justify-between items-center`}>
            <Text style={tw`text-[#040641] text-[13px]`}>
              {formatTime(position)}
            </Text>
            <Text style={tw`text-[#040641] text-[13px]`}>
              {formatTime(duration - position)}
            </Text>
          </View>
          <View style={tw`flex-row w-[80%] justify-between items-center`}>
            <TouchableOpacity onPress={seekBackward}>
              <Image
                source={require('../../assets/images/replayicon.png')}
                style={tw`w-6 h-6`}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={togglePlayback}>
              {isPlaying ? (
                <Image
                  source={require('../../assets/images/pauseicon.png')}
                  style={tw`w-22 h-22`}
                />
              ) : (
                <Image
                  source={require('../../assets/images/playbutton.png')}
                  style={tw`w-22 h-22`}
                />
              )}
            </TouchableOpacity>
            {/* <Button title='RESTART' onPress={trackEnded} /> */}
            <TouchableOpacity onPress={seekForward}>
              <Image
                source={require('../../assets/images/forwardicon.png')}
                style={tw`w-6 h-6`}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MainPlayer;
