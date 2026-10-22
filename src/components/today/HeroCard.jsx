import React from 'react';
import {View, Text, TouchableOpacity, ImageBackground} from 'react-native';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import {convertEventTime} from '../../utils/formattedDate';

import {
  EyeIcon,
  PlayIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from 'react-native-heroicons/solid';

const livePlaceholder = require('../../assets/images/ycalivechurch.png');
const eventPlaceholder = require('../../assets/images/ycaevents.png');

/* ================= LIVE CARD ================= */

const HeroLiveCard = ({liveChurch, navigation}) => {
  if (!liveChurch) return null;

  return (
    <TouchableOpacity
      style={tw`mb-6 rounded-5 overflow-hidden`}
      onPress={() =>
        navigation.navigate('LiveChurchDetails', {
          liveChurchId: liveChurch?._id,
        })
      }>
      <ImageBackground
        source={
          liveChurch?.cover_image?.full_url
            ? {uri: liveChurch.cover_image.full_url}
            : livePlaceholder
        }
        style={tw`h-65 justify-between`}
        imageStyle={tw`rounded-3xl`}>
        {/* TOP SECTION */}
        <View style={tw`flex-row justify-between items-start p-3`}>
          {/* LIVE NOW BADGE */}
          <View
            style={[
              tw`flex-row items-center px-3 py-1 rounded-full`,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.12)',
                shadowColor: '#000',
                shadowOpacity: 0.6,
                shadowRadius: 12,
                shadowOffset: {width: 0, height: 6},
                elevation: 4,
              },
            ]}>
            <View style={tw`w-2 h-2 bg-red-500 rounded-full mr-2`} />
            <Text style={tw`text-white text-xs font-semibold`}>LIVE NOW</Text>
          </View>

          {/* VIEW COUNT */}
          <View style={tw`flex-row items-center`}>
            <EyeIcon size={16} color="white" />
            <Text style={tw`text-white text-sm ml-1`}>
              {liveChurch?.viewCount || 400}
            </Text>
          </View>
        </View>

        {/* BOTTOM OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={tw`p-3`}>
          <Text style={tw`text-white text-lg font-semibold`} numberOfLines={2}>
            {liveChurch?.title || 'Passion City Church'}
          </Text>

          <View style={tw`flex-row flex-wrap items-center mt-1`}>
            <CalendarDaysIcon size={14} color="white" />
            <Text style={tw`text-white/80 text-sm ml-1`}>
              {convertEventTime(
                liveChurch?.start_date,
                liveChurch?.start_time,
                liveChurch?.church?.timezone?.tzCode,
              )}
            </Text>

            <Text style={tw`text-white/80 text-sm mx-2`}>•</Text>

            <MapPinIcon size={14} color="white" />
            <Text style={tw`text-white/80 text-sm ml-1`}>
              {liveChurch?.church?.city}, {liveChurch?.church?.state}
            </Text>
          </View>

          <TouchableOpacity
            style={tw`mt-4 bg-[#2F80ED] px-3 py-2.5 rounded-2 flex-row items-center self-start`}>
            <PlayIcon size={16} color="white" />
            <Text style={tw`text-white font-medium text-sm ml-1`}>
              Watch Live
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

/* ================= EVENT CARD ================= */

const HeroEventCard = ({event, navigation}) => {
  if (!event) return null;

  return (
    <TouchableOpacity
      style={tw`mb-2 rounded-3xl overflow-hidden`}
      onPress={() =>
        navigation.navigate('EventDetails', {
          eventId: event?._id,
        })
      }>
      <ImageBackground
        source={
          event?.cover_image?.full_url
            ? {uri: event.cover_image.full_url}
            : eventPlaceholder
        }
        style={tw`h-65 justify-between`}
        imageStyle={tw`rounded-3xl`}>
        {/* TOP BADGE */}
        <View style={tw`p-3`}>
          <View style={tw`bg-white/90 px-3 py-1 rounded-full self-start`}>
            <Text style={tw`text-xs font-medium text-black`}>
              Upcoming Event
            </Text>
          </View>
        </View>

        {/* BOTTOM OVERLAY */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={tw`p-4`}>
          <Text style={tw`text-white text-lg font-bold`} numberOfLines={2}>
            {event?.title}
          </Text>

          <View style={tw`flex-row flex-wrap items-center mt-1`}>
            <CalendarDaysIcon size={14} color="white" />
            <Text style={tw`text-white text-sm ml-2`}>
              {convertEventTime(
                event?.start_date,
                event?.start_time,
                event?.church?.timezone?.tzCode,
              )}
            </Text>

            <Text style={tw`text-white text-sm mx-2`}>•</Text>

            <MapPinIcon size={14} color="white" />
            <Text style={tw`text-white text-sm ml-1`}>
              {event?.church?.city}
            </Text>
          </View>

          <TouchableOpacity
            style={tw`mt-4 bg-[#2F80ED] px-4 py-2.5 rounded-xl flex-row items-center self-start`}>
            <Text style={tw`text-white font-medium text-sm`}>View details</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

/* ================= MAIN COMPONENT ================= */

const HeroCard = ({data, navigation}) => {
  if (!data) return null;

  if (data.type === 'livechurch') {
    return <HeroLiveCard liveChurch={data.data} navigation={navigation} />;
  }

  if (data.type === 'event') {
    return <HeroEventCard event={data.data} navigation={navigation} />;
  }

  return null;
};

export default HeroCard;
