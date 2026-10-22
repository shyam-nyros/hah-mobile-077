import React, {useRef, useState, useEffect} from 'react';
import {View, Text, Image, FlatList, Dimensions} from 'react-native';
import tw from 'twrnc';

const {width} = Dimensions.get('window');

const LeadersList = ({leaders}) => {
  const flatListRef = useRef(null);

  if (!leaders || leaders.length === 0) {
    return (
      <View style={tw`flex justify-center items-center mt-3 mb-3`}>
        <Text style={tw`text-[14px] text-[#040641]`}>No Leaders!</Text>
      </View>
    );
  }

  const renderItem = ({item}) => (
    <View key={item._id} style={tw`flex-1`}>
      <View
        style={tw`w-36 h-36 mr-2 bg-[#0077B6] rounded-[16px] justify-center items-center`}>
        <Image
          source={
            item?.profile_image
              ? {uri: item.profile_image}
              : require('../../assets/images/placeholder.png')
          }
          style={tw`w-12 h-12 mb-1 rounded-full`}
        />
        <Text style={tw`text-[#fff] text-[13px] font-medium`}>
          {`${item.first_name} ${item.last_name}`}
        </Text>
        <Text style={tw`text-[#fff] text-[13px] mb-1`}>Job Title</Text>
        <View style={tw`flex-row justify-center gap-2`}>
          <Image
            source={require('../../assets/images/groupwhiteicon.png')}
            style={tw`w-4 h-4`}
          />
          <Text style={tw`text-[#fff] text-[10px] underline`}>
            {item.jobs ? item.jobs.join(', ') : ''}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={leaders}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
      />
    </View>
  );
};

export default LeadersList;
