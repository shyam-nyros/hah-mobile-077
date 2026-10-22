import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';

const LeaderRequest = () => {
  return (
    <View>
      <View style={tw`flex-row flex-1 justify-between items-center`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('../../assets/images/leadersframe.png')}
            style={tw`w-12 h-12 rounded-full`}
          />
          <View style={tw`ml-3`}>
            <Text style={tw`text-[#040641] text-[16px] font-medium`}>
              Samuel Rodriguez
            </Text>
            <View style={tw``}>
              <Text style={tw`text-[#040641] opacity-40 text-[14px] `}>
                Pastor
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={tw` w-20 h-7 rounded-[6px] border-[1px] border-[#0077B6] items-center justify-center`}>
          <Text style={tw`text-[#0077B6] text-[13px]`}>Follow</Text>
        </TouchableOpacity>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-3 mb-3`} />
    </View>
  );
};

export default LeaderRequest;
