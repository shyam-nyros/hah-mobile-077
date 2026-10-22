import React, {useEffect} from 'react';
import {Image, SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import ChurchesActivitySlider from './slider/ChurchesActivitySlider';
import {useYourChurchActivityAPIQuery} from '../../features/home/homeApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import {useNavigation} from '@react-navigation/native';
import NoActivitiesPlaceholder from './slider/NoActivitySlider';
import {setFollowedChurchesIdsToFilter} from '../../features/home/homeSlice';

const YourChurchesActivity = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {selectedChurchId} = useSelector(state => state.auth);

  const {
    data: churchActivity,
    isLoading: churchActivityLoading,
    isFetching: churchActivityFetching,
    isError: churchActivityIsError,
    error: activityError,
  } = useYourChurchActivityAPIQuery();

  const handleChurchDetails = liveChurchId => {
    navigation.navigate('LiveChurchDetails', {
      liveChurchId,
      churchId: selectedChurchId,
    });
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`h-60 mb-4 gap-3 justify-between flex-row`}>
      {[...Array(1)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          style={tw`w-full h-[250px] rounded-[10px]`}
          shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
          LinearGradient={LinearGradient}
        />
      ))}
    </View>
  );

  useEffect(() => {
    if (!churchActivityLoading && churchActivity) {
      const a = churchActivity.activities;
      const items = a.filter(
        item =>
          item.activities_from === 'Followed Church' ||
          item.activities_from === 'Current Church' ||
          item.activities_from === 'Denomination' ||
          item.activities_from === 'Featured',
      );
      // const items = a.filter(item => item.activities_from === 'Followed Church');
      const ids = items.map(i => i._id);
      dispatch(setFollowedChurchesIdsToFilter(ids));
    }
  }, [churchActivity, churchActivityLoading, churchActivityFetching]);

  return (
    <SafeAreaView style={tw`flex-1 mb-8`}>
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('../../assets/images/churchicon1.png')}
            style={tw`w-5 h-5 mr-1`}
          />
          <Text
            style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
            Featured
          </Text>
        </View>
        {!churchActivityLoading && churchActivity?.live_church_id && (
          <TouchableOpacity
            onPress={() => handleChurchDetails(churchActivity.live_church_id)}>
            <Text
              style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
              See all {'>'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {churchActivityLoading || churchActivityFetching ? (
        renderShimmerPlaceholder()
      ) : churchActivityIsError ? (
        <View style={tw`flex-1 justify-center items-center p-4`}>
          <Text style={tw`text-gray-500`}>
            Failed to load Churches Activity
          </Text>
        </View>
      ) : churchActivity?.activities?.length === 0 ? (
        <View>
          <NoActivitiesPlaceholder />
        </View>
      ) : (
        <View>
          <ChurchesActivitySlider list={churchActivity.activities} />
        </View>
      )}
    </SafeAreaView>
  );
};

export default YourChurchesActivity;
