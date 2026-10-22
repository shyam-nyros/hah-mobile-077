import React, {useMemo} from 'react';
import {Text, View, TouchableOpacity, FlatList} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import EventListItem from './EventListItem';
import {useHappeningTodayAPIQuery} from '../../features/events/eventsApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const HappeningToday = ({coords}) => {
  const navigation = useNavigation();

  // Optional: Use coords if you plan to support location-based "today" events in the future
  const locationParam = useMemo(() => {
    return coords?.latitude && coords?.longitude
      ? {latitude: coords.latitude, longitude: coords.longitude}
      : null;
  }, [coords]);

  const {
    data: todayList,
    isLoading: todayListLoading,
    isFetching: todayListFetching,
    error: todayListError,
  } = useHappeningTodayAPIQuery(
    {location: locationParam},
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const handleSeeAllClick = () => {
    navigation.navigate('EventSearch', {eventCategory: 'today'});
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 mt-3 gap-3 justify-between flex-row`}>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={tw`h-[120px] w-[140px]`}>
          <ShimmerPlaceholder
            style={tw`h-[120px] w-[140px] rounded-[10px] mb-2`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[16px] w-[100px] rounded-[4px] mb-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[12px] w-[70px] rounded-[4px]`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  return (
    <View style={tw`bg-[#CAF0F8] bg-opacity-25`}>
      <View style={tw`mt-4 mx-4`}>
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-[16px] text-[#040641] font-medium mb-1`}>
            Happening Today
          </Text>
          <TouchableOpacity onPress={handleSeeAllClick}>
            <Text style={tw`text-[13px] text-[#040641] opacity-50`}>
              See all {'>'}
            </Text>
          </TouchableOpacity>
        </View>

        {todayListLoading || todayListFetching ? (
          renderShimmerPlaceholder()
        ) : todayListError ? (
          <View style={tw`justify-center mt-2 mb-2 items-center`}>
            <Text style={tw`text-black`}>Failed to load Happening Events</Text>
          </View>
        ) : todayList?.events?.length === 0 ? (
          <View style={tw`justify-center mt-2 mb-2 items-center`}>
            <Text style={tw`text-black`}>No Happening Today Events</Text>
          </View>
        ) : (
          <FlatList
            data={todayList.events}
            renderItem={({item}) => <EventListItem eventInfo={item} />}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={tw`flex-row`}
          />
        )}
      </View>
    </View>
  );
};

export default HappeningToday;
