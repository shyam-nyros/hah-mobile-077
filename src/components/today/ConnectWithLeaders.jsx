import React, {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {FlatList, Text, TouchableOpacity, View, Image} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useConnectWithLeadersQuery} from '../../features/home/homeApiSlice';
import {useNavigation} from '@react-navigation/native';

import ConnectWithLeadersItem from './ConnectWithLeadersItem';

const ConnectWithLeaders = () => {
  const navigation = useNavigation();

  const {
    data: leadersList,
    isLoading: leadersListLoading,
    isError: leadersListError,
    refetch: refetchLeadersList,
  } = useConnectWithLeadersQuery();

  useFocusEffect(
    useCallback(() => {
      refetchLeadersList();
    }, [refetchLeadersList]),
  );

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 flex-row`}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={tw`items-center`}>
          <ShimmerPlaceholder
            style={tw`h-16 w-16 rounded-full`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-3 w-17 rounded-md mt-2`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  const extendedLeadersList = leadersList
    ? [...leadersList, {isCustomCard: true}]
    : [];

  const renderLeaderItem = ({item}) => {
    if (item.isCustomCard) {
      return (
        <View style={tw`justify-center items-center`}>
          <TouchableOpacity
            style={tw`bg-[#e6f8fb] p-4 rounded-full items-center justify-center w-16 h-16 mt-4`}
            onPress={() => navigation.navigate('GlobalLeaderScreen')}>
            <Image
              source={require('../../assets/images/addicon.png')}
              style={tw`w-10 h-10`}
            />
          </TouchableOpacity>
          <Text
            style={tw`text-[12px] text-center text-[#0077B6] font-medium w-14 mt-1`}>
            Follow More
          </Text>
        </View>
      );
    }
    return <ConnectWithLeadersItem leaderInfo={item} />;
  };

  return (
    <View style={tw`mb-6`}>
      <View style={tw`flex-row justify-between items-center `}>
        <Text
          style={tw`text-[15px] md:text-[16px] lg:text-[16px] pb-3 text-[#040641] font-semibold`}>
          Follow Leaders
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('GlobalLeaderScreen')}>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] pb-3 text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70`}>
        Access Around the World
      </Text>

      {leadersListLoading ? (
        renderShimmerPlaceholder()
      ) : leadersListError ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load Leaders Data</Text>
        </View>
      ) : leadersList?.length === 0 ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Click "See All" to find leaders</Text>
        </View>
      ) : (
        <FlatList
          data={extendedLeadersList}
          renderItem={renderLeaderItem}
          keyExtractor={(item, index) => item._id || `custom-${index}`}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ConnectWithLeaders;
