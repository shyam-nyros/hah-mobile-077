import React, {useState} from 'react';
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import tw from 'twrnc';
import {truncateText} from '../../utils/helpers';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {useRsvpAPIMutation} from '../../features/events/eventsApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {formattedDateTime} from '../../utils/formattedDate';

const EventsTabListItems = ({event}) => {
  const [willAttend, setWillAttend] = useState(
    event?.currentUserResponse === 'Attending',
  );

  const [attendingCount, setAttendingCount] = useState(event.attendeesCount);

  const [rsvpAPI, {isLoading, isError}] = useRsvpAPIMutation();

  const handleEventConfirmation = async () => {
    const actionType = willAttend ? 0 : 1;
    
    try {
      const response = await rsvpAPI({
        id: event._id,
        rsvp: actionType,
      }).unwrap();

      setAttendingCount(response.event_attendee.attendeesCount);
      setWillAttend(!willAttend);
    } catch (error) {}
  };

  return (
    <>
      <View key={event._id} style={tw`mb-4`}>
        <Image
          source={{uri: event.cover_image}}
          style={[
            tw`rounded-tl-[10px] rounded-tr-[10px] w-[158px] `,
            styles.img,
          ]}
        />
        <View
          style={[
            tw`bg-[#0077B6] p-2  rounded-bl-[10px] rounded-br-[10px]  w-[158px]`,
            styles.card,
          ]}>
          {isLoading && (
            <View style={tw`flex justify-center items-center`}>
              <LoadingSpinner />
            </View>
          )}
          <Text style={tw`text-[9px] text-[#fff] font-medium`}>
            {formattedDateTime(event.start_date, event.end_date)}
          </Text>
          <Text style={tw`text-[13px] text-[#fff] mb-1 font-medium`}>
            {truncateText(event.title, 25)}
          </Text>
          <View style={tw` items-start mb-2 gap-1`}>
            <Text style={tw`text-[10px] text-[#fff] font-400 `}>
              {event?.church?.name}
            </Text>
            <View style={tw`flex-row items-center gap-1`}>
              <Image
                source={require('../../assets/images/locationiconwhite.png')}
                style={tw`w-3 h-3`}
              />
              <Text style={tw`text-[10px] text-[#fff] `}>
                {event?.church?.city}
              </Text>
            </View>
          </View>
          {/* <Text style={tw`text-[10px] text-[#fff] mb-2`}>{'Florida'}</Text> */}
          <View style={tw`flex-row  items-center`}>
            <View style={tw`relative mr-10`}>
              <Image
                source={require('../../assets/images/profile1.png')}
                style={tw`w-4 h-4 rounded-full absolute -top-2 left-0`}
              />
              <Image
                source={require('../../assets/images/profile3.png')}
                style={tw`w-4 h-4 rounded-full absolute -top-2 left-2`}
              />
              <Image
                source={require('../../assets/images/profile2.png')}
                style={tw`w-4 h-4 rounded-full absolute -top-2 left-4`}
              />
            </View>
            <Text style={tw`text-[10px] text-[#fff]`}>
              {attendingCount} attending
            </Text>
          </View>
          <View style={tw` items-center mt-1 mb-1`}>
            <TouchableOpacity
              disabled={isLoading}
              onPress={() => handleEventConfirmation(1)}
              style={tw`bg-[#ffff] px-4  py-1 mt-1 items-center justify-center rounded-full`}>
              <Text style={tw`text-[12px] text-[#040641]`}>
                {willAttend ? 'Not Attending' : 'I Will Attend'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

export default EventsTabListItems;

const styles = StyleSheet.create({
  img: {
    height: hp('18.5%'),
    width: wp('43.5%'),
  },
  card: {
    paddingHorizontal: hp('17.5%'),
    width: wp('43.5%'),
  },
});
