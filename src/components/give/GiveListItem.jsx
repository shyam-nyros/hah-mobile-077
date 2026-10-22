import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import tw from 'twrnc';

const GiveListItem = ({item, index}) => {
  const navigation = useNavigation();
  const handleGiveDetails = giveProjectId => {
    navigation.navigate('GiveDetails', {giveProjectId});
  };

  return (
    <View
      key={item._id}
      style={tw`py-4 ${index % 2 === 0 ? 'bg-[#B2E9F3]' : 'bg-[#66D2E8]'}`}>
      <TouchableOpacity
        onPress={() => handleGiveDetails(item._id)}
        style={tw`mx-4`}>
        <View>
          <View>
            <Text style={tw`text-[16px] text-[#040641] mb-1 font-semibold`}>
              {item.title}
            </Text>
            <Text
              numberOfLines={5}
              style={tw`text-[14px] text-[#040641] opacity-70 `}>
              {item.description}
            </Text>
          </View>
        </View>
        <View style={tw`items-end mt-2`}>
          <TouchableOpacity
            onPress={() => handleGiveDetails(item._id)}
            // onPress={() => openLinkInBrowser(item.donation_link)}
            style={tw`flex-row gap-2 justify-center bg-white p-2 rounded-full border-[2px] border-[#040641]`}>
            <Text style={tw`text-[14px] text-[#040641] font-medium`}>
              {/* Raising USD ${item.price.$numberDecimal} */}
              Start with ${item.price.$numberDecimal}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default GiveListItem;
