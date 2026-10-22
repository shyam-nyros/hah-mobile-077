import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import tw from 'twrnc';
import {WebView} from 'react-native-webview';

// Tab Section
import FeedTab from '../../components/livechurch/FeedTab';
import BibleTab from '../../components/livechurch/BibleTab';
import ScheduleTab from '../../components/livechurch/ScheduleTab';
import EventsTab from '../../components/livechurch/EventsTab';
import GiveTab from '../../components/livechurch/GiveTab';
import AboutTab from '../../components/livechurch/AboutTab';
import {useLiveChurchDetailsAPIQuery} from '../../features/livechurches/liveChurchAPiSlice';
import {setLiveChurchDetails, setLiveChurchNotStarted, setLiveChurchStarted} from '../../features/livechurches/liveChurchSlice';
import {useDispatch, useSelector} from 'react-redux';
import {
  useAddAnotherChurchAPIMutation,
  useDeleteAnotherChurchAPIMutation,
} from '../../features/auth/authApiSlice';
import {
  setFollowedChurches,
  removeItemFromFollowedChurchList,
} from '../../features/auth/authSlice';
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

const LiveChurchDetailsScreen = ({route, navigation}) => {
  const {isSpeaking} = useSelector(state => state.livechurch);
  const {followedChurchList} = useSelector(state => state.auth);
  const {liveChurchId, churchId} = route.params;

  const dispatch = useDispatch();

  const [liveEventStarted, setLiveEventStarted] = useState(false);
  const [showInfoAlert, setShowInfoAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('Feed');
  const [followLoading, setFollowLoading] = useState(false);

  const [addAnotherChurchAPI] = useAddAnotherChurchAPIMutation();
  const [deleteAnotherChurchAPI] = useDeleteAnotherChurchAPIMutation();

  const isAlreadyFollowed = followedChurchList.some(c => c._id === churchId);

  const handleFollow = async () => {
    if (followedChurchList.length >= 10) {
      Alert.alert('Limit Reached', 'You can follow up to 10 churches.');
      return;
    }
    setFollowLoading(true);
    try {
      const response = await addAnotherChurchAPI({church: churchId}).unwrap();
      dispatch(setFollowedChurches(response.following_churches));
    } catch {
      Alert.alert('Error', 'Failed to follow church. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowLoading(true);
    try {
      await deleteAnotherChurchAPI({church: churchId}).unwrap();
      dispatch(removeItemFromFollowedChurchList({id: churchId}));
    } catch {
      Alert.alert('Error', 'Failed to unfollow church. Please try again.');
    } finally {
      setFollowLoading(false);
    }
  };

  const {
    data: liveChurchDetails,
    isLoading: liveChurchDetailsLoading,
    isFetching: liveChurchDetailsFetching,
    error: liveChurchDetailsError,
  } = useLiveChurchDetailsAPIQuery(
    {liveChurchId: liveChurchId ? liveChurchId : churchId},
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
      dispatch(setLiveChurchDetails(liveChurchDetails));
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
      liveChurchDetails && liveChurchDetails?.ytLiveInfo && liveChurchDetails?.ytLiveInfo?.kind) {
      setLiveEventStarted(true);
      dispatch(setLiveChurchStarted())
      setShowInfoAlert(false);

    } else {
   
      dispatch(setLiveChurchNotStarted())
  
      setShowInfoAlert(true);
      setLiveEventStarted(false);
    }
  };  

  useEffect(() => {
    if (!liveChurchDetailsLoading && liveChurchDetails) {
      checkLiveEventStartStatus();
    }
  }, [liveChurchDetailsLoading, liveChurchDetails, churchId, liveChurchId]);

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
      <NavHeader onBackPress={navigateToPreviousScreen} title="Live Church" />

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
            {/* Church Live */}
            {liveChurchDetails?.liveChurch?.liveChurch && (
              <>
                <View style={tw`mt-2 mx-4 flex-row items-center justify-between`}>
                  <Text
                    numberOfLines={1}
                    style={tw`text-[16px] text-[#040641] font-semibold flex-1 mr-3`}>
                    {liveChurchDetails?.liveChurch?.church?.name}
                  </Text>
                  <TouchableOpacity
                    onPress={isAlreadyFollowed ? handleUnfollow : handleFollow}
                    disabled={followLoading}
                    style={tw`rounded-full overflow-hidden`}>
                    <LinearGradient
                      colors={
                        isAlreadyFollowed
                          ? ['#EF4444', '#DC2626']
                          : ['#48CAE4', '#0096C7']
                      }
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={tw`px-4 py-[6px]`}>
                      <Text style={tw`text-white text-[12px] font-semibold`}>
                        {followLoading
                          ? '...'
                          : isAlreadyFollowed
                          ? 'Unfollow'
                          : 'Follow'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

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
                              uri: liveChurchDetails?.liveChurch?.liveChurch
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
            <View style={tw`flex-1`}>
              {/* Custom Tab Bar */}
              <View style={tw`flex-row bg-white`}>
                {['Feed', 'Bible', 'Schedule', 'Events', 'Give', 'About'].map(
                  tab => (
                    <TouchableOpacity
                      key={tab}
                      onPress={() => setActiveTab(tab)}
                      style={tw`flex-1 items-center py-3`}>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: 'bold',
                          color:
                            activeTab === tab
                              ? '#040641'
                              : 'rgba(4, 6, 41, 0.5)',
                        }}>
                        {tab}
                      </Text>
                      {activeTab === tab && (
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            width: '60%',
                            height: 2,
                            backgroundColor: '#040641',
                            borderRadius: 10,
                          }}
                        />
                      )}
                    </TouchableOpacity>
                  ),
                )}
              </View>

              {/* Tab Content */}
              <View style={tw`flex-1`}>
                {activeTab === 'Feed' && (
                  <FeedTab
                    liveChurchId={liveChurchId}
                    churchId={churchId}
                    liveEventStarted={liveEventStarted}
                  />
                )}
                {activeTab === 'Bible' && <BibleTab />}
                {activeTab === 'Schedule' && <ScheduleTab />}
                {activeTab === 'Events' && <EventsTab />}
                {activeTab === 'Give' && <GiveTab />}
                {activeTab === 'About' && <AboutTab />}
              </View>
            </View>
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

export default LiveChurchDetailsScreen;
