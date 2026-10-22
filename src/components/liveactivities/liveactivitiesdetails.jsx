import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
} from 'react-native';
import tw from 'twrnc';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {WebView} from 'react-native-webview';

// Tab Section
import ActivitiesFeed from '../../components/liveactivities/ActivitiesFeedTab';
import BibleTab from '../../components/livechurch/BibleTab';

import {useLiveActivitiesDetailsAPIQuery} from '../../features/liveactivity/liveActivityAPiSlice';
// import {
//   setLiveChurchDetails,
//   setLiveChurchNotStarted,
//   setLiveChurchStarted,
// } from '../../features/liveactivity/liveActivitySlice';
import {
  setLiveActivitiesDetails,
  setLiveActivitiesStarted,
  setLiveActivitiesNotStarted,
} from '../../features/liveactivity/liveActivitySlice';
import {useDispatch, useSelector} from 'react-redux';
import LoadingSpinner from '../../components/LoadingSpinner';
import {stopIsSpeaking} from '../../features/livechurches/liveChurchSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import Tts from 'react-native-tts';
import YouTubePlayer from 'react-native-youtube-iframe';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import NavHeader from '../../navigation/NavHeader';
import {
  formattedLocalDate,
  formattedLocalTime,
} from '../../utils/formattedDate';
import moment from 'moment';
import InfoAlert from '../../utils/customalert/InfoAlert';

const LiveActivitiesDetailsScreen = ({route, navigation}) => {
  //   const {isSpeaking} = useSelector(state => state.livechurch);
  const {liveActivityId, christianId} = route.params;

  const dispatch = useDispatch();

  const [liveEventStarted, setLiveEventStarted] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);

  const Tab = createMaterialTopTabNavigator();

  const {
    data: liveChurchDetails,
    isLoading: liveChurchDetailsLoading,
    isFetching: liveChurchDetailsFetching,
    error: liveChurchDetailsError,
  } = useLiveActivitiesDetailsAPIQuery(
    {liveActivityId: liveActivityId, christianId: christianId},
    {refetchOnMountOrArgChange: true},
  );

  

  const navigateToPreviousScreen = () => {
    navigation.goBack();
    dispatch(stopIsSpeaking());
    Tts.removeAllListeners('tts-finish');
    Tts.stop();
  };

  useEffect(() => {
    if (
      liveChurchDetails &&
      !liveChurchDetailsLoading &&
      !liveChurchDetailsFetching
    ) {
      dispatch(setLiveActivitiesDetails(liveChurchDetails));
    }
  }, [
    liveChurchDetails,
    liveChurchDetailsLoading,
    liveChurchDetailsFetching,
    dispatch,
  ]);

  // const checkLiveEventStartStatus = () => {
  //   const utcStartDate = liveChurchDetails?.liveChurch?.liveChurch?.start_date;
  //   const localStartDate = formattedLocalDate(utcStartDate);
  //   const utcSeconds = liveChurchDetails?.liveChurch?.liveChurch?.start_time;
  //   const localTime = formattedLocalTime(utcSeconds);
  //   const dateObject = moment(
  //     `${localStartDate} ${localTime}`,
  //     'ddd, MMM D hh:mm A',
  //   );

  //   const eventDate = new Date(dateObject.toISOString());

  //   const todayDate = new Date();

  //   if (eventDate > todayDate) {

  //     setLiveEventStarted(false);
  //     return false;
  //   } else {

  //     setLiveEventStarted(true);
  //     return true;
  //   }
  // };

  const checkLiveEventStartStatus = () => {
    if (
      liveChurchDetails &&
      liveChurchDetails?.ytLiveInfo &&
      liveChurchDetails?.ytLiveInfo?.kind
    ) {
      setLiveEventStarted(true);
      dispatch(setLiveActivitiesStarted());
      setShowInfoAlert(false);
    } else {
      dispatch(setLiveActivitiesNotStarted());

      setShowInfoAlert(true);
      setLiveEventStarted(false);
    }
  };

  useEffect(() => {
    if (!liveChurchDetailsLoading && liveChurchDetails) {
      checkLiveEventStartStatus();
    }
  }, [liveChurchDetailsLoading, liveChurchDetails, liveActivityId, christianId]);

  // useEffect(() => {
  //   if (!liveChurchDetailsLoading && liveChurchDetails && !liveEventStarted) {
  //     setShowInfoAlert(true);
  //   }else {
  //     setShowInfoAlert(false);
  //   }
  // }, [liveChurchDetailsLoading, liveChurchDetails, liveEventStarted]);

  return (
    <View style={tw`bg-white flex-1`}>
      {/* Header */}
      <NavHeader
        onBackPress={navigateToPreviousScreen}
        title="Live Activities"
      />

      {liveChurchDetailsLoading ? (
        <>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`h-10 mt-5 ml-3 w-[80%] rounded-md mb-4`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`h-[44%] w-full rounded-md`}
          />
          <View style={tw`flex-row mt-3 mx-3`}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`h-6 w-15 rounded-md mr-2`}
            />
          </View>
        </>
      ) : liveChurchDetailsError ? (
        <>
          <Text>Error State</Text>
        </>
      ) : (
        <>
          {/* Body */}
          <KeyboardAvoidingView
            style={tw`flex-1`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
            {/* Live Church Labels */}
            <View>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={tw`bg-white`}></ScrollView>
            </View>

            {/* Church Live */}
            {liveChurchDetails?.liveActivity?.liveActivity && (
              <>
                <Text
                  style={tw`mt-2 mx-4 text-[16px] text-[#040641] font-semibold`}>
                  {liveChurchDetails?.liveActivity?.christian_organizations?.name}
                  {/*Title */}
                  {/* {liveChurchDetails?.liveChurch?.liveChurch?.church?.name} */}
                </Text>

                <View style={tw``}>
                  <View style={tw` w-full`}>
                    <View style={tw` mt-2 flex-row gap-1 items-center`}>
                      <View
                        style={[
                          styles.container,
                          {height: liveEventStarted ? hp('24%') : hp('43%')},
                        ]}>
                        {/* {liveEventStarted &&
                          <WebView
                            style={styles.video}
                            javaScriptEnabled={true}
                            source={{
                              uri: liveChurchDetails?.liveChurch?.liveChurch
                                ?.streaming_link,
                            }}
                          />
                        } */}
                        {/* if the live is started or ongoing */}
                        {liveEventStarted && (
                          <YouTubePlayer
                            height={300}
                            play={true}
                            videoId={liveChurchDetails?.ytLiveInfo?.id?.videoId}
                          />
                        )}

                        {!liveEventStarted && (
                          <WebView
                            style={styles.video}
                            javaScriptEnabled={true}
                            // source={{
                            //   uri: 'https://www.youtube.com/channel/UCoDt562cJaageYU-LYKt4Pw/live'
                            // }}
                            source={{
                              uri: liveChurchDetails?.liveActivity?.liveActivity
                                ?.streaming_link,
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={tw`text-[#FF3C3C] text-[14px] font-semibold absolute top-3 left-5`}>
                        Live
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

             {/* Live Church Tabs */}
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: '#040641',
                tabBarInactiveTintColor: 'rgba(4, 6, 41, 0.5)',
                tabBarLabelStyle: {
                  fontSize: 11,
                  justifyContent: 'space-between',
                  fontWeight: 'bold',
                  height: 20,
                  width: 64,
                  textAlign: 'center',
                },
                tabBarIndicatorStyle: {
                  backgroundColor: '#040641',
                  height: 2,
                  width: '50%',
                  marginLeft: '1%',
                  marginRight: '1%',
                  marginBottom: 3,
                  borderRadius: 10,
                },
                tabBarStyle: {
                  height: 38,
                  shadowOpacity: 0,
                  elevation: 0,
                },
                tabBarItemStyle: {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                tabBarShowLabel: true,
              }}>
              <Tab.Screen
                name="Feed"
                // listeners={{
                //   tabPress: e => {
                //     // if the live event is not started then prevent the click event for the tabs
                //     if (!liveEventStarted) {
                //       e.preventDefault();
                //     }
                //   },
                // }}
                // options={{swipeEnabled: !liveEventStarted}}
                component={ActivitiesFeed}
                initialParams={{liveActivityId, christianId, liveEventStarted}}
              />
              <Tab.Screen
                name="Bible"
                component={BibleTab}
                // options={{swipeEnabled: !liveEventStarted}}
                // listeners={{
                //   tabPress: e => {
                //     if (!liveEventStarted) {
                //       e.preventDefault();
                //     }
                //   },
                // }}
              />
            
            </Tab.Navigator>
          </KeyboardAvoidingView>
          <InfoAlert
            // if not started then show the alert
            visible={showInfoAlert}
            boldText={''}
            message={
              'This event has not started. Please enjoy past videos in the Streams tab below'
            }
            onConfirm={() => {
              setShowInfoAlert(false);
            }}
            onCancel={() => {
              setShowInfoAlert(false);
            }}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    // height: hp('75%'),
    // height: hp('24%'),
  },
  video: {
    width: '100%',
    height: hp('44%'),
  },
});

export default LiveActivitiesDetailsScreen;
