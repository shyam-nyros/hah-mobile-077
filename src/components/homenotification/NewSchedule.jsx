import React from 'react';
import {Image, Text, View} from 'react-native';
import tw from 'twrnc';

// No mobile screen exists yet for the standalone Schedule feature, so this
// renders the notification without any tap-to-navigate behavior.
const NewSchedule = ({info}) => {
  return (
    <View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2`}>
          <View style={tw`relative`}>
            <Image
              source={
                info?.cover_image
                  ? {uri: info.cover_image}
                  : require('../../assets/images/whiteplaceholder.png')
              }
              style={tw`w-10 h-10 bg-black rounded-lg mb-1`}
            />
          </View>
          <View>
            <Text style={tw`flex-row mt-2 flex-1 flex-wrap w-[85%]`}>
              <Text style={tw`font-bold text-[#040641] text-[14px]`}>
                {info?.title}
              </Text>{' '}
              <Text style={tw`text-[#040641] text-[14px]`}>
                {info?.message}
              </Text>
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default NewSchedule;
