import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';

const Message = ({info}) => {
  return (
    <View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2`}>
          <View style={tw`relative `}>
            <Image
              source={require('../../assets/images/whiteplaceholder.png')}
              style={tw`w-10 h-10 rounded-full`}
            />
          </View>
          <View style={tw``}>
            <View style={tw`flex-row`}>
              <Text
                numberOfLines={2}
                style={tw`text-[#040641] text-[14px] font-semibold`}>
                  {info?.title}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default Message;
