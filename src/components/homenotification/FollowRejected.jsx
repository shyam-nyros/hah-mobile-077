import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';

const FollowRejected = ({info}) => {
  return (
    <View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2`}>
          <View style={tw`relative `}>
            <Image
              source={
                info?.user?.profile_image
                  ? {uri: info?.user?.profile_image}
                  : require('../../assets/images/whiteplaceholder.png')
              }
              style={tw`w-10 h-10 bg-black rounded-full mb-1`}
            />
          </View>
          <View style={tw``}>
            <View style={tw`flex-row mt-2`}>
              <Text style={tw`text-[#040641] text-[14px]`}>
                <Text style={tw`font-bold`}>
                  {info.user.first_name} {info.user.last_name}
                </Text>{' '}
                rejected your connection request
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default FollowRejected;
