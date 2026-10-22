import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import tw from 'twrnc';
import {useFollowLeaderAPIMutation} from '../../features/messages/messageApiSlice';
import LoadingSpinner from '../LoadingSpinner';

const NotificationSuggestionListItem = ({suggestion}) => {
  const [
    followLeaderAPI,
    {isLoading: followLeaderLoading, isError: followLeaderError},
  ] = useFollowLeaderAPIMutation();

  const handleFollowLeader = async userId => {
    try {
      const response = await followLeaderAPI({recipientId: userId}).unwrap();
   
    } catch (error) {
     
    }
  };

  return (
    <>
      {!suggestion?.isFollowing && (
        <View style={tw`flex-1 bg-white`}>
          <View style={tw`flex-row justify-between items-center`}>
            {/* {followLeaderLoading && <LoadingSpinner size={'small'} />} */}
            <View style={tw`flex-row items-center`}>
              <View>
                <Image
                  source={require('../../assets/images/leadersframe.png')}
                  style={tw`absolute top-[-7.5px] left-[-7.2px] w-13 h-13 rounded-full`}
                />
                <Image
                  source={
                    suggestion?.profile_image
                      ? {uri: suggestion?.profile_image}
                      : require('../../assets/images/whiteplaceholder.png')
                  }
                  style={tw`${
                    suggestion?.is_leader
                      ? 'w-9 h-9 left-1.3 top-0.7'
                      : 'w-9.5 h-9.5'
                  } rounded-full`}
                />
                {suggestion?.is_verified && (
                  <Image
                    source={require('../../assets/images/profilebadge.png')}
                    style={tw`w-[16px] h-[17px] absolute top-[8] left-[9]`}
                  />
                )}
              </View>
              <View style={tw`ml-5`}>
                <Text style={tw`text-[#040641] text-[16px] font-medium`}>
                  {`${suggestion?.first_name} ${suggestion?.last_name}`}
                </Text>
                <View style={tw`w-30`}>
                  <Text
                    style={tw`text-[#040641] opacity-40 text-[14px] `}
                    numberOfLines={1}>
                    {suggestion?.profession}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleFollowLeader(suggestion?._id)}
              style={tw` w-20 h-7 rounded-[6px] border-[1px] border-[#0077B6] items-center justify-center`}>
              <Text style={tw`text-[#0077B6] text-[13px]`}>Follow</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
        </View>
      )}
    </>
  );
};

export default NotificationSuggestionListItem;
