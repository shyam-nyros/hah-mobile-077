import React from 'react';
import {View, Text} from 'react-native';
import tw from 'twrnc';

const UserMessage = ({content}) => {
  return (
    <View style={tw`mb-1 mt-1 flex-row justify-end`}>
      <View style={tw`max-w-[80%]`}>
        <View
          style={tw`bg-[#00bcd4] rounded-tl-[20px] rounded-tr-[20px] rounded-bl-[20px] rounded-br-[5px] px-4 py-3`}>
          <Text style={tw`text-white text-[14px] leading-5`}>{content}</Text>
        </View>
      </View>
    </View>
  );
};

export default UserMessage;
