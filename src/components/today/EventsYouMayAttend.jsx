import React, {useRef, useState} from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import {useEventsYouMayAttendAPIQuery} from '../../features/home/homeApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import LoadingSpinner from '../LoadingSpinner';
import {truncateText} from '../../utils/helpers';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  convertEventTime,
  formattedLocalDate,
  formattedLocalTime,
  getFormattedDate,
} from '../../utils/formattedDate';

const {height, width} = Dimensions.get('window');

const EventsYouMayAttend = () => {
  const navigation = useNavigation();
  const {firstName, location} = useSelector(state => state.auth);

  const {
    data: events,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    error: eventsIsError,
  } = useEventsYouMayAttendAPIQuery();

  // Handle address concatenation
  const concatAddress = item => {
    if (item?.church?.address) {
      return item.church.address;
    } else if (item?.organization?.address) {
      return item.organization.address;
    } else if (item?.organization?.city) {
      return item.organization.city;
    } else {
      return 'No address available';
    }
  };

  const handleEventDetails = eventId => {
    navigation.navigate('EventDetails', {eventId});
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 justify-between flex-row`}>
      {[...Array(3)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          style={[tw` h-[160px] w-full rounded-[10px]`, styles.container]}
          shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
          LinearGradient={LinearGradient}
        />
      ))}
    </View>
  );

  const renderItem = ({item}) => (
    <Animated.View>
      <View key={item._id}>
        <TouchableOpacity
          onPress={() => handleEventDetails(item._id)}
          style={[
            tw`bg-[#0077B6] p-3 pb-8 w-full rounded-[12px] mr-4`,
            styles.container,
          ]}>
          {/* Event Cover Image */}
          <View style={tw`bg-[#e6f8fb] h-[94px] rounded-[12px] mb-2`}>
            <TouchableOpacity onPress={() => handleEventDetails(item._id)}>
              <View>
                {!item?.aigenerated && (
                  <Image
                    source={
                      item?.cover_image?.path
                        ? {uri: item?.cover_image?.path}
                        : require('../../assets/images/defaults/eventslarge.png')
                    }
                    style={tw`w-full h-[94px] rounded-[10px]`}
                    resizeMode="cover"
                  />
                )}
                {item?.aigenerated && (
                  <Image
                    source={
                      item?.ai_cover_image
                        ? {uri: item?.ai_cover_image}
                        : require('../../assets/images/defaults/eventslarge.png')
                    }
                    style={tw`w-full h-[94px] rounded-[10px]`}
                    resizeMode="cover"
                  />
                )}

                {/* Icon based on event_type */}
                {item?.event_type === 'online' && (
                  <Image
                    source={require('../../assets/images/online.png')}
                    style={tw`w-6 h-6 rounded-[10px] absolute top-1 right-1 opacity-90`}
                  />
                )}
                {item?.event_type === 'offline' && (
                  <Image
                    source={require('../../assets/images/nearby.png')}
                    style={tw`w-6 h-6 rounded-[10px] absolute top-1 right-1 opacity-90`}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Event Title */}
          <Text
            style={tw`text-[14px] text-[#fff] font-medium`}
            numberOfLines={1}>
            {item.title}
          </Text>

          {/* Event Address */}
          <Text style={tw`text-[11px] text-[#fff] mt-1`} numberOfLines={1}>
            {item?.event_type === 'online' ? (
              <Text
                style={tw`text-[11px] w-90% text-[#fff] font-medium`}
                numberOfLines={1}>
                {truncateText(concatAddress(item), 150)}
              </Text>
            ) : (
              <Text
                style={tw`text-[11px] w-90% text-[#fff] font-medium`}
                numberOfLines={1}>
                {item?.address}
              </Text>
            )}
          </Text>

          {/* Event Date and Time */}
          <Text
            style={[tw`text-[#fff] font-medium mt-1 `, styles.date]}
            numberOfLines={2}>
            {/* {getFormattedDate(
              item?.start_date,
              item?.start_time,
              item?.end_time,
            )} */}

            {/* {`${formattedLocalDate(item?.start_date)} ${formattedLocalTime(
              item?.start_time,
            )} ${formattedLocalTime(item?.end_time)}`} */}
            {convertEventTime(
              item?.start_date,
              item?.start_time,
              item?.timezone?.tzCode,
            )}
          </Text>
          {/* <Text>{item?.timezone?.tzCode}</Text> */}
          {/* <Text>{item?.start_time ? item?.start_time : "NO"}</Text> */}
          <View
            style={tw`absolute bottom-2 left-2 bg-white py-1 px-2 mt-1 rounded-full font-medium`}>
            <Text
              style={[tw`text-[#040641] font-medium`, styles.date]}
              numberOfLines={1}>
              {item.activities_from}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <>
      <View style={tw`flex-row justify-between items-center  mt-2`}>
        <View style={tw`flex-row`}>
          <Image
            source={require('../../assets/images/calendaricon.png')}
            style={tw`w-[17px] h-[17px] mr-1`}
          />
          <Text
            style={tw`text-[15px] md:text-[16px] lg:text-[16px] pb-3 text-[#040641] font-semibold`}>
            Digital Events you may attend, {firstName}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Events')}>
          <Text
            style={tw`text-[13px] md:text-[14px] pb-3 lg:text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      {eventsIsLoading || eventsIsFetching ? (
        renderShimmerPlaceholder()
      ) : eventsIsError ? (
        <View style={tw`flex-1 mb-4 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load Events</Text>
        </View>
      ) : events && events?.length === 0 ? (
        <View style={tw`flex-1 mb-5 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500 text-center w-70`}>
            There are no events! Click "See All" to explore more events.
          </Text>
        </View>
      ) : (
        <View style={tw`mb-6`}>
          {/* {location?.city && (
            <Text
              style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
              Because you are living in {location?.city}
            </Text>
          )} */}

          <View style={tw`relative`}>
            <FlatList
              data={events}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: wp('48.7%'),
  },
  date: {
    fontSize: 9,
  },
});

export default EventsYouMayAttend;
