import React from 'react';
import {Text, View, Image} from 'react-native';
import tw from 'twrnc';

const AddChurchRequest = ({info}) => {
  return (
    <View>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2`}>
          <View style={tw`relative`}>
            <Image
              source={
                info.image
                  ? {uri: info.image}
                  : require('../../assets/images/whiteplaceholder.png')
              }
              style={tw`w-10 h-10 rounded-full`}
            />
          </View>
          <View>
            <Text
              numberOfLines={2}
              style={tw`text-[#040641] text-[14px] font-semibold`}>
              {info.title} invites you to join their group
            </Text>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default AddChurchRequest;
