import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useGlobalLeadersAPIQuery} from '../../features/library/libraryApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const GlobalLeaders = () => {
  const navigation = useNavigation();

  const {
    data: globalLeadersList,
    isLoading: globalLeadersListLoading,
    isFetching: globalLeadersListFetching,
    error: globalLeadersListError,
  } = useGlobalLeadersAPIQuery();

  const itemWidth = wp('5%');

  const handleLeaderClickNavigation = leaderId => {
    navigation.navigate('LeaderProfile', {leaderId});
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 flex-row`}>
      {[...Array(5)].map((_, index) => (
        <View key={index} style={tw`items-center`}>
          {/* Profile Image Placeholder */}
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
          <ShimmerPlaceholder
            style={tw`h-3 w-15 rounded-md mt-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-3 w-12 rounded-md mt-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  if (globalLeadersListLoading || globalLeadersListFetching) {
    return renderShimmerPlaceholder();
  }

  if (globalLeadersList?.length === 0) {
    return (
      <View style={tw`flex justify-center items-center mt-3 mb-3`}>
        <Text style={tw`text-[14px] text-[#040641]`}>No Global Leaders !</Text>
      </View>
    );
  }

  const renderItem = ({item, index}) => (
    <View key={item._id}>
      <TouchableOpacity
        style={tw`w-20 ${index === 1 ? 'mr-[10px]' : 'mr-[10px]'}`}
        onPress={() => handleLeaderClickNavigation(item._id)}>
        <View style={tw`justify-center items-center mt-2`}>
          <View style={tw`justify-center items-center`}>
            <View>
              <Image
                source={require('../../assets/images/leadersframe.png')}
                style={tw`w-18 h-18`}
              />
              <Image
                source={{uri: item.profile_image}}
                style={tw`w-[54px] h-[54px] absolute top-[9px] rounded-full right-[9px]`}
              />
            </View>
            {/* apply the badge for the featured leaders only */}
            {item.featured && (
              <Image
                source={require('../../assets/images/profilebadge.png')}
                style={tw`w-[13px] h-[13px] absolute top-[62px] right-[3px]`}
              />
            )}
            {/* {item.is_verified && (
              <Image
                source={require('../../assets/images/profilebadge.png')}
                style={tw`w-[13px] h-[13px] absolute top-[62px] right-[3px]`}
              />
            )} */}
            <Text
              numberOfLines={2}
              style={tw`text-[12px] text-center text-[#0077B6] mb-[1px] font-medium w-14 mt-1`}>
              {`${item.first_name} ${item.last_name}`}
            </Text>
            <Text
              numberOfLines={1}
              style={tw`text-[11px] text-center text-[#040641] opacity-60 mb-[1px] font-500 w-auto `}>
              {item.jobs}
            </Text>
            <Text
              numberOfLines={1}
              style={tw`text-[11px] text-center text-[#040641] opacity-50  w-auto `}>
              {item.country}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      {globalLeadersList && globalLeadersList?.length > 0 && (
        <FlatList
          data={globalLeadersList}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default GlobalLeaders;
