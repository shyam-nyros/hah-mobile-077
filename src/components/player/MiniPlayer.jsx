import {View, Text, Image, TouchableOpacity} from 'react-native';
import React, {useEffect} from 'react';
import tw from 'twrnc';
import Slider from '@react-native-community/slider';
import {useDispatch, useSelector} from 'react-redux';
import {resetAndCloseStickyPlayer} from '../../features/auth/authSlice';
import {resetPlayer} from './Controls';

const MiniPlayer = ({
  expandPlayer,
  trackTitle,
  trackArtist,
  trackCover,
  duration,
  position,
  handleSeek,
  togglePlayback,
  seekToZero,
}) => {
  const {isPlaying, currentTrackInfo} = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const resetStickyPlayer = () => {
    resetPlayer();
    dispatch(resetAndCloseStickyPlayer());
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const bottomValue = Platform.OS === 'ios' ? 'bottom-19' : 'bottom-15';
  return (
    <View
      style={tw`absolute ${bottomValue} left-0 right-0 bg-[#F8F8F8] border-t border-[#040641] border-opacity-10`}>
      <View style={tw`mx-4 my-2 flex-row items-center justify-between`}>
        {currentTrackInfo && (
          <TouchableOpacity onPress={expandPlayer}>
            {/* cover image for AI generated */}
            {currentTrackInfo?.aigenerated && (
              <Image
                source={
                  currentTrackInfo?.ai_cover_image
                    ? {uri: currentTrackInfo.ai_cover_image}
                    : require('../../assets/images/podcastplaceholder.png')
                }
                style={tw`w-18 h-16 rounded-[12px]`}
              />
            )}
            {/* cover image for not AI generated */}
            {!currentTrackInfo?.aigenerated && (
              <Image
                source={
                  currentTrackInfo?.cover
                    ? {uri: currentTrackInfo?.cover}
                    : require('../../assets/images/podcastplaceholder.png')
                }
                style={tw`w-18 h-16 rounded-[12px]`}
              />
            )}
          </TouchableOpacity>
        )}
        <View style={tw`flex-1 mx-4`}>
          <TouchableOpacity onPress={expandPlayer}>
            <Text style={tw`text-[#040641] text-[16px] font-medium`}>
              {/* {currentTrackInfo?.title} */}
              {truncateText(currentTrackInfo?.title, 25)}
            </Text>
            {/* <Text style={tw`text-[#040641] text-[16px] font-medium`}>
              {isPlaying ? 'PLAYING' : 'NOT PLAYING'}
            </Text> */}
            <Text style={tw`text-[#040641] text-[13px] opacity-70`}>
              {currentTrackInfo?.artist.first_name}
            </Text>
          </TouchableOpacity>
          <Slider
            style={{width: '100%', height: 20}}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#0077B6"
            maximumTrackTintColor="rgba(0, 119, 182, 0.4)"
            thumbTintColor="#0077B6"
            onSlidingComplete={handleSeek}
          />
        </View>
        <TouchableOpacity onPress={togglePlayback}>
          {isPlaying ? (
            <Image
              source={require('../../assets/images/pauseicon.png')}
              style={tw`w-10 h-10`}
            />
          ) : (
            <Image
              source={require('../../assets/images/playbutton.png')}
              style={tw`w-10 h-10`}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => resetStickyPlayer()}>
          <Image
            source={require('../../assets/images/closeicon.png')}
            style={tw`w-5 h-5`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MiniPlayer;
