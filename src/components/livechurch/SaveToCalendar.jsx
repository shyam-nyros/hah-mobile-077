import React, {useEffect, useState} from 'react';
import {Alert, Image, TouchableOpacity, View} from 'react-native';
import showToast from '../../utils/toast/showToast';
import RNCalendarEvents from 'react-native-calendar-events';
import {useCalenderSaveAPIMutation} from '../../features/auth/authApiSlice';
import {convertEventTime} from '../../utils/formattedDate';
const {DateTime} = require('luxon');
import tw from 'twrnc';

const SaveToCalendar = ({item, liveChurchId, event_type, add_to_calender}) => {
  const [savedToCalendar, setSavedToCalendar] = useState(
    add_to_calender || false,
  );
  const [saveEvent] = useCalenderSaveAPIMutation();

  useEffect(() => {
    setSavedToCalendar(false);
  }, [add_to_calender]);

  const concatAddress = item => {
    // check for church object present or not and check for empty obj
    if (item.church && Object.keys(item?.church).length > 0) {
      return `${item?.church?.address ? item?.church?.address : ''} - ${
        item?.church?.city ? item?.church?.city : ''
      } - ${item?.church?.state ? item?.church?.state : ''} - ${
        item?.church?.country ? item?.church?.country : ''
      }`;
      // check for organization present or not
    } else if (item?.organization) {
      return `${item?.organization?.city ? item?.organization?.city : ''} - ${
        item?.organization?.state ? item?.organization?.state : ''
      } - ${item?.organization?.country ? item?.organization?.country : ''}`;
    } else {
      return '';
    }
  };

  const saveEventToCalendar = async eventInfo => {
    try {
      const validEventTypes = ['Event', 'Live Church'];
      const eventTypeToSend = validEventTypes.includes(event_type)
        ? event_type
        : 'Event';

      // Payload for API call
      const payload = {
        event_type: eventTypeToSend,
        event: liveChurchId,
        title: eventInfo.title,
        start_date: eventInfo.start_date,
        end_date: eventInfo.end_date || null,
        location: concatAddress(eventInfo),
      };

      const response = await saveEvent(payload);

      // event start time formatting to save in calendar
      const eventStartTime = convertEventTime(
        item?.start_date,
        item?.start_time,
        item?.timezone?.tzCode,
      );

      const formattedEventStartTime = DateTime.fromFormat(
        eventStartTime,
        "ccc, LLL d, yyyy 'at' h:mm a 'GMT'Z",
      );

      const eventStartTimeInISOString = formattedEventStartTime.toUTC().toISO();

      // event end time formatting to save in calendar
      const eventEndTime = convertEventTime(
        item?.end_date ? item?.end_date : item?.start_date,
        item?.end_time ? item?.end_time : item?.start_time,
        item?.timezone?.tzCode,
      );

      const formattedEventEndTime = DateTime.fromFormat(
        eventEndTime,
        "ccc, LLL d, yyyy 'at' h:mm a 'GMT'Z",
      );
      const eventEndTimeInISOString = formattedEventEndTime.toUTC().toISO();

      if (response?.data) {
        const permission = await RNCalendarEvents.requestPermissions();
        if (permission !== 'authorized') {
          Alert.alert('Permission Denied', 'Calendar permission is required.');
          return;
        }

        // Get the list of calendars on the device
        const calendars = await RNCalendarEvents.findCalendars();

        let targetCalendar;

        if (Platform.OS === 'android') {
          // Android-specific calendar selection
          targetCalendar = calendars.find(
            calendar =>
              calendar.isPrimary &&
              calendar.source.includes('@gmail.com') &&
              calendar.type === 'com.google' &&
              calendar.allowsModifications,
          );
        } else if (Platform.OS === 'ios') {
          // iOS-specific calendar selection
          targetCalendar = calendars.find(
            calendar => calendar.isPrimary && calendar.allowsModifications,
          );
        }

        if (!targetCalendar) {
          Alert.alert(
            'Unable to save to calendar',
            Platform.OS === 'android'
              ? 'Make sure Google account sync is enabled and allows modifications.'
              : 'Ensure the calendar is editable.',
          );
          return;
        }

        const eventDetails = {
          title: eventInfo.title,
          startDate: eventStartTimeInISOString,
          endDate: eventEndTimeInISOString,
          location: concatAddress(eventInfo),
          notes: 'Added via app',
          calendarId: targetCalendar.id,
        };

        // Save event to local calendar
        const calendarEventId = await RNCalendarEvents.saveEvent(
          eventInfo.title,
          eventDetails,
        );

        if (calendarEventId) {
          showToast('success', `${eventTypeToSend} saved to your calendar!`);
          setSavedToCalendar(true);
        } else {
          Alert.alert(
            'Error',
            'Failed to save the event to the local calendar. Please try again.',
          );
        }
      } else {
        Alert.alert(
          'Error',
          `Failed to save the ${eventTypeToSend} to the calendar. ${
            response?.error?.message || ''
          }`,
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save to the calendar.');
    }
  };

  return (
    <View style={tw`absolute right-0`}>
      {savedToCalendar ? (
        <Image
          source={require('../../assets/images/eventbordericonactive.png')}
          style={tw`w-6 h-6`}
        />
      ) : (
        <TouchableOpacity onPress={() => saveEventToCalendar(item)}>
          <Image
            source={require('../../assets/images/calendarbordericon.png')}
            style={tw`w-6 h-6`}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SaveToCalendar;
