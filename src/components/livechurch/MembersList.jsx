import React, {useRef} from 'react';
import {View, Text, Image, FlatList, Dimensions} from 'react-native';
import tw from 'twrnc';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const MembersList = ({members}) => {
  const flatListRef = useRef(null);

  if (!members || members.length === 0) {
    return (
      <View style={tw`flex justify-center items-center mt-3 mb-3`}>
        <Text style={tw`text-[14px] text-[#040641]`}>No Members!</Text>
      </View>
    );
  }

  const renderItem = ({item}) => (
    <View key={item._id} style={tw`flex-1`}>
      <View
        style={tw`w-36 h-30 mr-2 border-[1px] border-[#0077B6] rounded-[16px] justify-center items-center`}>
        <Image
          source={
            item?.profile_image
              ? {uri: item.profile_image}
              : require('../../assets/images/placeholder.png')
          }
          style={tw`w-12 h-12 mb-1 rounded-full`}
        />
        <Text
          style={tw`text-[#0077B6] text-[13px] md:text-[16px] lg:text-[16px] font-medium`}>
          {`${item.first_name} ${item.last_name}`}
        </Text>
        <Text
          style={tw`text-[#0077B6] text-[13px] md:text-[16px] lg:text-[16px] mb-1`}>
          {item.jobs ? item.jobs.join(', ') : ''}
        </Text>
      </View>
    </View>
  );

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={members}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
      />
    </View>
  );
};

export default MembersList;
