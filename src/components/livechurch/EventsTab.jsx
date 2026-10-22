import React from 'react';
import {useSelector} from 'react-redux';
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
import EventsTabListItems from './EventsTabListItems';
import { formattedDateTime } from '../../utils/formattedDate';

const EventsTab = () => {
  const {liveChurchDetails} = useSelector(state => state.livechurch);

  return (
    <ScrollView style={tw`bg-white`}>
      <View style={tw`mx-4 flex-1 mt-2 justify-center`}>
        <View style={tw` w-full flex flex-row flex-wrap justify-between`}>
          {liveChurchDetails?.liveChurch?.events?.length > 0 &&
            liveChurchDetails.liveChurch.events.map(event => (
              <EventsTabListItems event={event} key={event._id}  />
            ))}
        </View>
        {liveChurchDetails?.liveChurch?.events?.length === 0 && (
          <View style={tw`flex justify-center items-center mt-6`}>
            <Text style={tw`text-[14px] text-[#040641]`}>No Events!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

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

export default EventsTab;
