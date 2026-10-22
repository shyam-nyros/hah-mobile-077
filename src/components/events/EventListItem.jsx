import React, {memo, useEffect, useState} from 'react';
import {
  Platform,
  Alert,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import tw from 'twrnc';
import {truncateText} from '../../utils/helpers';
import EventModal from './EventModal';
import {useRsvpAPIMutation} from '../../features/events/eventsApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import showToast from '../../utils/toast/showToast';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  convertEventTime,
  formatDate,
  formattedLocalDate,
  formattedLocalTime,
  getFormattedDate,
} from '../../utils/formattedDate';
import SaveToCalendar from '../livechurch/SaveToCalendar';

const EventListItem = ({eventInfo, showVertical, groupBy, page, search}) => {
  const navigation = useNavigation();
  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [attendingCount, setAttendingCount] = useState(
    eventInfo.attendeesCount,
  );
  // const [attending, setAttending] = useState(
  //   eventInfo.currentUserResponse ? eventInfo.currentUserResponse : 'default',
  // );
  const [attending, setAttending] = useState(
    eventInfo.currentUserResponse || 'default',
  );
  const [eventSaved, setEventSaved] = useState(false);

  const [rsvpAPI, {isLoading, isError}] = useRsvpAPIMutation();

  // Navigate to event details
  const handleEventDetails = eventId => {
    navigation.navigate('EventDetails', {eventId});
  };

  // RSVP handler
  const handleEventConfirmation = async actionType => {
    try {
      const response = await rsvpAPI({
        id: eventInfo._id,
        rsvp: actionType,
        groupBy,
        page,
        search,
      }).unwrap();

      setAttendingCount(response.event_attendee.attendeesCount);
      setAttending(
        response.event_attendee.rsvp === 'Attending'
          ? 'Attending'
          : 'Not Attending',
      );
    } catch (error) {
      // Handle error
    } finally {
      setModalVisible(false);
    }
  };

  // Save event to the calendar
  // const saveEvent = async () => {
  //   try {
  //     const permission = await RNCalendarEvents.requestPermissions();
  //     if (permission === 'authorized') {
  //

  //       const calendars =
  //         Platform.OS === 'android'
  //           ? await RNCalendarEvents.findCalendars()
  //           : [];
  //       const pickedCal = calendars.find(
  //         cal => cal.isPrimary && cal.allowsModifications,
  //       );
  //       const calendarId = pickedCal?.id;

  //       // Get the start date from the event info
  //       const startDate = new Date(eventInfo.start_date);
  //       const endDate = new Date(startDate);
  //       endDate.setHours(endDate.getHours() + 1);

  //       const eventId = await RNCalendarEvents.saveEvent(eventInfo.title, {
  //         calendarId: Platform.OS === 'android' ? calendarId : undefined,
  //         startDate: startDate.toISOString(),
  //         endDate: endDate.toISOString(),
  //         location: eventInfo.address,
  //       });

  //       setEventSaved(true);
  //       showToast('success', 'Event Saved successfully!');
  //     } else {
  //       Alert.alert(
  //         'Permission Denied',
  //         'Cannot save event without calendar access.',
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error:', error);
  //     Alert.alert('Error', 'An error occurred while saving the event.');
  //   }
  // };

  useEffect(() => {
    // setAttending(
    //   eventInfo.currentUserResponse ? eventInfo.currentUserResponse : 'default',
    // );
    setAttending(eventInfo.currentUserResponse || 'default');
    setAttendingCount(eventInfo.attendeesCount);
  }, [eventInfo]);

  return (
    <View>
      <View style={tw`mb-4 flex-row `}>
        <TouchableOpacity
          onPress={() => handleEventDetails(eventInfo._id)}
          style={tw`${showVertical ? 'w-auto' : 'py-2 pr-3 w-auto'}`}>
          <View>
            {eventInfo?.aigenerated && eventInfo?.ai_cover_image ? (
              <Image
                source={{uri: eventInfo.ai_cover_image}}
                style={[tw`rounded-[10px]`, styles.img]}
              />
            ) : eventInfo?.cover_image?.path ? (
              <Image
                source={{uri: eventInfo.cover_image.path}}
                style={[tw`rounded-[10px]`, styles.img]}
              />
            ) : (
              <Image
                source={require('../../assets/images/defaults/eventslarge.png')}
                style={[tw`rounded-[10px]`, styles.img]}
              />
            )}
          </View>
          <View style={tw`mt-1`}>
            <TouchableOpacity onPress={() => handleEventDetails(eventInfo._id)}>
              <Text
                style={[tw`text-[#0077B6] mb-1 font-medium`, styles.textsize]}>
                {/* {truncateText(eventInfo?.title, 20)} */}
                {truncateText(eventInfo?.title, 20)}
              </Text>
            </TouchableOpacity>
            {eventInfo?.event_type && eventInfo?.event_type === 'online' && (
              <Text
                numberOfLines={1}
                style={[
                  tw`text-[#040641] opacity-80 mb-1 w-[155px] flex flex-wrap`,
                  styles.textlocation,
                ]}>
                <Text numberOfLines={1}>
                  {/* {eventInfo?.church?.address
                    ? eventInfo?.church?.address
                    : eventInfo?.organization?.address
                    ? eventInfo?.organization?.address
                    : eventInfo?.organization?.city} */}
                  {eventInfo?.church?.address
                    ? eventInfo.church.address
                    : eventInfo?.organization?.address
                    ? eventInfo.organization.address
                    : eventInfo?.christian_organization?.address
                    ? eventInfo.christian_organization.address
                    : eventInfo?.christian_organization?.city}
                </Text>
              </Text>
            )}
            {eventInfo?.event_type && eventInfo?.event_type === 'offline' && (
              <Text
                numberOfLines={1}
                style={[
                  tw`text-[#040641] opacity-80 mb-1 w-[155px] flex flex-wrap`,
                  styles.textlocation,
                ]}>
                {/* {truncateText(eventInfo.address, 25)} */}
                {eventInfo.address}
              </Text>
            )}
            <Text
              style={[
                tw`text-[9px] text-[#040641] opacity-50`,
                styles.textdate,
              ]}>
              {/* {formatDate(eventInfo?.start_date)}, {eventInfo?.start_time} -
              {eventInfo?.end_time} */}
              {/* {truncateText(
                getFormattedDate(
                  eventInfo?.start_date,
                  eventInfo?.start_time,
                  eventInfo?.end_time,
                ),
                30,
              )} */}
              {/* {`${formattedLocalDate(
                eventInfo?.start_date,
              )} - ${formattedLocalTime(
                eventInfo?.start_time,
              )} -${formattedLocalTime(eventInfo?.end_time)}`} */}
              {convertEventTime(
                eventInfo?.start_date,
                eventInfo?.start_time,
                eventInfo?.timezone?.tzCode,
              )}
            </Text>
            <View style={tw`flex-row justify-between items-center mt-1`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`relative mr-9`}>
                  <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-0`}
                  />
                  <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-2`}
                  />
                  <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={tw`w-4 h-4 rounded-full absolute bg-white -top-2 left-4`}
                  />
                </View>
                <Text
                  style={[tw`text-[#040641] opacity-70`, styles.textattended]}>
                  {attendingCount} attending
                </Text>
              </View>
              <View style={tw`flex-row flex-1 justify-end`}>
                <View style={tw`flex-row gap-2`}>
                  <View>
                    <SaveToCalendar
                      item={eventInfo}
                      liveChurchId={eventInfo._id}
                      event_type="Event"
                      add_to_calender={eventInfo.add_to_calender}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() =>
                      handleEventConfirmation(attending === 'Attending' ? 0 : 1)
                    }>
                    {attending === 'default' && (
                      <Image
                        source={require('../../assets/images/personbordericon.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    )}

                    {attending === 'Attending' && (
                      <Image
                        source={require('../../assets/images/personbordericongreen.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    )}

                    {attending === 'Not Attending' && (
                      <Image
                        source={require('../../assets/images/personbordericon.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    )}
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    onPress={() => {
                      setModalVisible(true);
                    }}>
                    {attending === 'default' ? (
                      <Image
                        source={require('../../assets/images/personbordericon.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    ) : attending === 'Attending' ? (
                      <Image
                        source={require('../../assets/images/personbordericongreen.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    ) : (
                      <Image
                        source={require('../../assets/images/personbordericonred.png')}
                        style={tw`w-[22px] h-[22px]`}
                      />
                    )}
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/****  Modal start ****/}
      {/* <EventModal
        setModalVisible={setModalVisible}
        modalVisible={modalVisible}
        eventInfo={eventInfo}
        handleEventConfirmation={handleEventConfirmation}
      /> */}
      {isLoading && <LoadingSpinner />}
    </View>
  );
};

export default EventListItem;
// export default memo(EventListItem);

const styles = StyleSheet.create({
  img: {
    height: hp('13%'),
    width: wp('42%'),
  },
  textsize: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
  },
  textlocation: {
    fontSize: hp('1.4%'),
  },
  textdate: {
    fontSize: hp('1.2%'),
    ...(Platform.OS === 'ios' && {
      fontSize: hp('1.2%'),
    }),
  },
  textattended: {
    fontSize: hp('1.2%'),
  },
});
