import moment from 'moment';
import React from 'react';
import {Image, Text, View} from 'react-native';
import tw from 'twrnc';

const GroupChatSenderMessageItem = ({content, createdAt}) => {

  
  return (
    <>
      <View style={tw`mt-3  flex-row justify-end items-start gap-2`}>
        <View
          style={tw`bg-[#00B4D8] ml-18 flex-row gap-2  flex-wrap flex justify-end items-center p-[10px] rounded-[10px] rounded-tr-[0px] shadow-sm shadow-white`}>
          <Text style={tw`text-[#fff] text-[14px]`}>{content}</Text>
          <Text style={tw`text-[#fff] text-right text-[10px] -mt-3`}>
            {moment(createdAt).format('hh.mm A')}
          </Text>
        </View>
      </View>
      {/* Seen message */}
      {/* <Text style={tw`text-[#fff] text-[12px] text-right`}>Seen</Text> */}
    </>
  );
};

export default GroupChatSenderMessageItem;
