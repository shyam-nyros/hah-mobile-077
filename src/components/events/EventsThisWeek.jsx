import React, {useMemo} from 'react';
import {Text, View, TouchableOpacity, FlatList} from 'react-native';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import EventListItem from './EventListItem';
import {useEventsThisWeekAPIQuery} from '../../features/events/eventsApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

const EventsThisWeek = ({coords}) => {
  const navigation = useNavigation();

  // Optional: Use coords if you plan to support location-based "today" events in the future
  const locationParam = useMemo(() => {
    return coords?.latitude && coords?.longitude
      ? {latitude: coords.latitude, longitude: coords.longitude}
      : null;
  }, [coords]);

  const {
    data: weekList,
    isLoading: weekListLoading,
    isFetching: weekListFetching,
    error: weekListError,
  } = useEventsThisWeekAPIQuery(
    {location: locationParam},
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    },
  );

  const handleSeeAllClick = eventId => {
    navigation.navigate('EventSearch', {eventCategory: 'week'});
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
    <View style={tw`mt-4 mx-4`}>
      <View style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row`}>
          <Text style={tw`text-[16px] text-[#040641] font-medium mb-1`}>
            Events This Week
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleSeeAllClick()}>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      {weekListLoading || weekListFetching ? (
        renderShimmerPlaceholder()
      ) : weekListError ? (
        <View style={tw`flex-1 justify-center mt-2 mb-2 items-center`}>
          <Text style={tw`text-black`}>Failed to load This Week Events</Text>
        </View>
      ) : weekList?.events?.length === 0 ? (
        <View style={tw`flex-1 justify-center mt-2 mb-2 items-center`}>
          <Text style={tw`text-black`}>No This Week Events</Text>
        </View>
      ) : (
        <FlatList
          data={weekList?.events}
          renderItem={({item}) => <EventListItem eventInfo={item} />}
          keyExtractor={item => item._id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`flex-row`}
        />
      )}
    </View>
  );
};

export default EventsThisWeek;
