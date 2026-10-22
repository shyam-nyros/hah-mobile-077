import React from 'react';
import {useSelector} from 'react-redux';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import LeadersList from './LeadersList';
import MembersList from './MembersList';

const AboutTab = () => {
  const {liveChurchDetails} = useSelector(state => state.livechurch);
  const leaders = liveChurchDetails?.liveChurch?.about?.leaders || [];
  const members = liveChurchDetails?.liveChurch?.about?.members || [];



  return (
    <ScrollView style={tw`bg-white`}>
      <View style={tw`mx-4`}>
        <Text
          style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] font-semibold mb-2`}>
          Leaders
        </Text>
        {leaders.length > 0 ? (
          <LeadersList leaders={leaders} />
        ) : (
          <View style={tw`flex justify-center items-center`}>
            <Text style={tw`text-[14px] text-[#040641]`}>No Leaders!</Text>
          </View>
        )}
      </View>
      <View style={tw`mx-4 mt-4 mb-10`}>
        <Text
          style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] font-semibold mb-2`}>
          Members
        </Text>
        {members.length > 0 ? (
          <MembersList members={members} />
        ) : (
          <View style={tw`flex justify-center items-center`}>
            <Text style={tw`text-[14px] text-[#040641]`}>No Members!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default AboutTab;
