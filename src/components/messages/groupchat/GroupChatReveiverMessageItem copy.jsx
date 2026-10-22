import React from 'react';
import {Image, Text, View} from 'react-native';
import tw from 'twrnc';
import {formatDate} from '../../utils/formattedDate';
import moment from 'moment';

const GroupChatReveiverMessageItem = ({
  name,
  profileImage,
  content,
  createdAt,
}) => {
  return (
    <View style={tw`mt-3 flex-row gap-2`}>
      <Image
        source={
          profileImage
            ? {uri: profileImage}
            : require('../../../assets/images/whiteplaceholder.png')
        }
        style={tw`w-7 h-7 rounded-full`}
      />
      <View
        style={tw`bg-white mr-18 justify-end flex pb-[10px] pr-[10px] pl-[10px] pt-[3px] rounded-[10px] rounded-tl-[0px] shadow-sm`}>
        <Text style={tw`text-[15px] text-[#040641] font-medium`}>{name}</Text>
        <Text style={tw`text-[#0d0d0d] text-[14px]`}>{content}</Text>
        <Text style={tw`text-[#aaa] text-right text-[10px] `}>
          {moment(createdAt).format('hh.mm A')}
        </Text>
      </View>
    </View>
  );
};

export default GroupChatReveiverMessageItem;
