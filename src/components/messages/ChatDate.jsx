import React from 'react';
import {Text, View} from 'react-native';
import tw from 'twrnc';
import { formatDate } from '../../utils/formattedDate';

const ChatDate = ({createdAt}) => {
  return (
   <>
   <View style={tw`mt-2`}>
   <Text style={tw`text-[#fff]  text-[12px] text-center`}>
      {formatDate(createdAt)}
    </Text>
   </View>
   </>
  );
};

export default ChatDate;
