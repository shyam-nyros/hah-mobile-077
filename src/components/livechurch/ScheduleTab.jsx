import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import tw from 'twrnc';
import {
  convertEventTime,
  getEventTimeAMPM,
  getEventDateFormatted,
} from '../../utils/formattedDate';

const ScheduleTab = () => {
  const {liveChurchDetails} = useSelector(state => state.livechurch);

  return (
    <>
      {/* <ScrollView style={tw`bg-white`}>
        {liveChurchDetails?.liveChurch?.schedule?.length > 0 && (
          <View style={tw`px-4 bg-white`}>
            {liveChurchDetails.liveChurch.schedule.map(dateItem => (
              <View key={dateItem._id}>
                <Text
                  style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] mt-2 mb-1 opacity-50 font-bold`}>
                  {getEventDateFormatted(dateItem._id, scheduleItem?.start_time, liveChurchDetails?.liveChurch?.church?.timezone?.tzCode)}
                </Text>
                <View
                  style={tw`w-full  flex-1 rounded-[18px] mt-1 mb-4 py-4 bg-[#0077B6]`}>
                  {dateItem.schedules.map((scheduleItem, scheduleIndex) => (
                    <View key={scheduleIndex} style={tw`mx-4 mb-2`}>
                      <View>
                        <Text
                          style={tw`text-[#fff] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
                          {getEventTimeAMPM(dateItem._id, scheduleItem?.start_time, liveChurchDetails?.liveChurch?.church?.timezone?.tzCode)}
                          
                        </Text>
                        
                        <Text
                          style={tw`text-[#fff] text-[14px] md:text-[16px] lg:text-[16px]`}>
                          {scheduleItem.title}
                        </Text>
                      </View>
                      {scheduleIndex < dateItem.schedules.length - 1 && (
                        <View
                          style={tw`border-b border-gray-300 opacity-30 mb-2 mt-2`}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        {liveChurchDetails?.liveChurch?.schedule?.length === 0 && (
          <View style={tw`flex justify-center items-center mt-6`}>
            <Text style={tw`text-[14px] text-[#040641]`}>No Schedule !</Text>
          </View>
        )}
      </ScrollView> */}

      {/* <ScrollView style={tw`bg-white`}>
  {liveChurchDetails?.liveChurch?.schedule?.length > 0 && (
    <View style={tw`px-4 bg-white`}>
      {liveChurchDetails.liveChurch.schedule.map((dateItem) => {
        // Extract the first available scheduleItem to use its start_time for date formatting
        const firstScheduleItem = dateItem.schedules?.[0];

        return (
          <View key={dateItem._id}>
            <Text
              style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] mt-2 mb-1 opacity-50 font-bold`}
            >
              {getEventDateFormatted(
                dateItem._id,
                firstScheduleItem?.start_time, // Use the first available start_time for the date
                liveChurchDetails?.liveChurch?.church?.timezone?.tzCode
              )}
            </Text>
            <View
              style={tw`w-full flex-1 rounded-[18px] mt-1 mb-4 py-4 bg-[#0077B6]`}
            >
              {dateItem.schedules.map((scheduleItem, scheduleIndex) => (
                <View key={scheduleIndex} style={tw`mx-4 mb-2`}>
                  <View>
                    <Text
                      style={tw`text-[#fff] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}
                    >
                      {getEventTimeAMPM(
                        dateItem._id,
                        scheduleItem?.start_time, // Pass dynamically for time formatting
                        liveChurchDetails?.liveChurch?.church?.timezone?.tzCode
                      )}
                    </Text>

                    <Text
                      style={tw`text-[#fff] text-[14px] md:text-[16px] lg:text-[16px]`}
                    >
                      {scheduleItem.title}
                    </Text>
                  </View>
                  {scheduleIndex < dateItem.schedules.length - 1 && (
                    <View style={tw`border-b border-gray-300 opacity-30 mb-2 mt-2`} />
                  )}
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  )}
  {liveChurchDetails?.liveChurch?.schedule?.length === 0 && (
    <View style={tw`flex justify-center items-center mt-6`}>
      <Text style={tw`text-[14px] text-[#040641]`}>No Schedule !</Text>
    </View>
  )}
</ScrollView> */}

      <ScrollView style={tw`bg-white`}>
        {liveChurchDetails?.liveChurch?.schedule?.length > 0 && (
          <View style={tw`px-4 bg-white`}>
            {liveChurchDetails.liveChurch.schedule.map(dateItem => (
              <View key={dateItem._id}>
                {dateItem.schedules.map((scheduleItem, scheduleIndex) => (
                  <View key={scheduleIndex}>
                    {/* Pass start_time dynamically for each scheduleItem */}
                    <Text
                      style={tw`text-[#040641] text-[15px] md:text-[16px] lg:text-[16px] mt-2 mb-1 opacity-50 font-bold`}>
                      {getEventDateFormatted(
                        dateItem._id,
                        scheduleItem?.start_time, 
                        liveChurchDetails?.liveChurch?.church?.timezone?.tzCode,
                      )}
                    </Text>

                    <View
                      style={tw`w-full flex-1 rounded-[18px] mt-1 mb-4 py-4 bg-[#0077B6]`}>
                      <View style={tw`mx-4 mb-2`}>
                        <Text
                          style={tw`text-[#fff] text-[15px] md:text-[16px] lg:text-[16px] font-semibold`}>
                          {getEventTimeAMPM(
                            dateItem._id,
                            scheduleItem?.start_time, // Also dynamic for time
                            liveChurchDetails?.liveChurch?.church?.timezone?.tzCode,
                          )}
                        </Text>

                        <Text
                          style={tw`text-[#fff] text-[14px] md:text-[16px] lg:text-[16px]`}>
                          {scheduleItem.title}
                        </Text>
                      </View>

                      {scheduleIndex < dateItem.schedules.length - 1 && (
                        <View
                          style={tw`border-b border-gray-300 opacity-30 mb-2 mt-2`}
                        />
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        {liveChurchDetails?.liveChurch?.schedule?.length === 0 && (
          <View style={tw`flex justify-center items-center mt-6`}>
            <Text style={tw`text-[14px] text-[#040641]`}>No Schedule !</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default ScheduleTab;
