import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  TextInput,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';
import YourChurchesActivity from '../../components/today/YourChurchesActivity';
import NewsList from '../../components/today/AiNews';
import LiveChurchesNearYou from '../../components/today/LiveChurchesNearYou';
import EventsYouMayAttend from '../../components/today/EventsYouMayAttend';
import HeroCard from '../../components/today/HeroCard';
import {useDispatch, useSelector} from 'react-redux';
import {
  useAppShareLinkAPIQuery,
  useUserDetailsQuery,
  useUserFollowedChurchesAPIQuery,
  useDailyVerseAPIQuery,
} from '../../features/auth/authApiSlice';
import {
  logout,
  setLocation,
  setUserInfo,
  hideAddRequestForm,
  setAppShareLinks,
  setFollowedChurches,
  hideLiveModalForm,
  setShowMinistryIcon,
} from '../../features/auth/authSlice';
import {clearMessages} from '../../features/assistance/assistanceSlice';
import {
  usePickedForYouAPIQuery,
  useTodayHeroCardAPIQuery,
} from '../../features/home/homeApiSlice';
import PickedForYou from '../../components/today/PickedForYou';
import Feed from '../../components/today/Feed';
import ChatWithFriends from '../../components/today/ChatWithFriends';
import ConnectWithLeaders from '../../components/today/ConnectWithLeaders';
import SlideScreen from '../../utils/flatlist/Content';
import NavHeaders from '../../components/navheaders/NavHeaders';
import {useRegisterFCMTokenMutation} from '../../features/pushnotifications/notificationsApiSlice';
import notifee from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';
import SearchModal from '../../components/today/SearchModal';
import ActivityModal from '../../components/today/ActivityModal';
import {setChurchList} from '../../features/churches/churchSlice';
import OtherLiveChurchModal from '../../components/livechurch/OtherLiveChurchModal';
import CurrentChurchModal from '../../components/today/CurrentChurchModal';
import {convertEventTime} from '../../utils/formattedDate';
import {Platform} from 'react-native';

const MINISTRY_MOOD_OPTIONS = [
  {id: 'm-1', content: '🤩 Excited'},
  {id: 'm-2', content: '😫 Stressed'},
  {id: 'm-3', content: '😌 Relaxed'},
  {id: 'm-4', content: '💡 Inspired'},
  {id: 'm-5', content: '😊 Happy'},
  {id: 'm-6', content: '😔 Lonely'},
];

const TodayScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const [registerFCMToken] = useRegisterFCMTokenMutation();

  const {
    firstName,
    selectedChurchId,
    addRequestForm,
    liveModalForm,
    currentChurchModal,
    location,
    interestedContent,
  } = useSelector(state => state.auth);

  const {churchList} = useSelector(state => state.church);
  const {addMoreChurchesModal} = useSelector(state => state.livechurch);

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // get user details
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
    isFetching: userInfoIsFetching,
    isError: userInfoIsError,
  } = useUserDetailsQuery();

  // get app share links for ios and android
  const {
    data: shareLinks,
    isLoading: shareLinksLoading,
    isError: shareLinksError,
  } = useAppShareLinkAPIQuery();

  const {
    data: followedChurches,
    isLoading: followedChurchListLoading,
    isFetching: followedChurchListFetching,
    error: followedChurchListError,
  } = useUserFollowedChurchesAPIQuery();

  // Get hero card data
  const {data: heroCardData, isLoading: heroCardLoading} =
    useTodayHeroCardAPIQuery();

  // Get daily verse
  const {data: dailyVerse, isLoading: dailyVerseLoading} =
    useDailyVerseAPIQuery();

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleMinistryMoodPress = (moodContent) => {
    dispatch(clearMessages());
    navigation.navigate('MinistryAssistantScreen', {
      initialMessage: moodContent,
      resetConversation: true,
    });
  };

  useEffect(() => {
    if (!userInfoIsLoading && userInfo) {
      dispatch(setUserInfo(userInfo));
      dispatch(
        setLocation({
          country: userInfo?.country,
          state: userInfo?.state,
          city: userInfo?.city,
          address: userInfo?.address,
          zipcode: userInfo?.zipcode,
        }),
      );
      // show the ministry floating icon when the user logged in
      dispatch(setShowMinistryIcon());
    }
  }, [userInfo, userInfoIsFetching, userInfoIsLoading, dispatch]);

  useEffect(() => {
    if (!shareLinksLoading && shareLinks) {
      dispatch(
        setAppShareLinks({
          android: shareLinks?.share_url?.android,
          ios: shareLinks?.share_url?.ios,
        }),
      );
    }
  }, [shareLinks, shareLinksLoading]);

  // set user followed churches on load
  useEffect(() => {
    if (!followedChurchListLoading && followedChurches) {
      if (followedChurches?.length > 0) {
        dispatch(setFollowedChurches(followedChurches));
      }
    }
  }, [followedChurchListLoading, followedChurches, followedChurchListFetching]);

  useEffect(() => {
    const fetchFCMToken = async () => {
      await notifee.requestPermission();
      try {
        const token = await messaging().getToken();

        // old code
        // const response = await registerFCMToken({token}).unwrap();
        const response = await registerFCMToken({
          token,
          platform: Platform.OS,
        }).unwrap();
      } catch (error) {}
    };

    fetchFCMToken();
  }, [registerFCMToken]);

  return (
    <View style={tw`bg-white flex-1`}>
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <NavHeaders title={'Home'} />
      </SafeAreaView>
      <ScrollView>
        {/** Body **/}
        <View style={tw`px-4 py-6`}>
          {/* ✅ Search Bar (now separate component like others) */}
          <View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowSearchOverlay(true)}>
              <View
                style={tw`flex-row items-center h-12 px-5 rounded-full border border-[#E2E8F0]`}>
                <Image
                  source={require('../../assets/images/searchicon.png')}
                  style={tw`w-5 h-5 mr-3 tint-[#212529]`}
                />

                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={tw`text-[14px] text-[#64748B] flex-1`}>
                  Find teachings, podcasts and live church events..
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {/* Search Modal */}
          <SearchModal
            showSearchOverlay={showSearchOverlay}
            setShowSearchOverlay={setShowSearchOverlay}
          />

          {/* Daily Reflection */}
          {!dailyVerseLoading && dailyVerse && (
            <View style={tw`mt-4 mb-2`}>
              <ImageBackground
                source={require('../../assets/images/dailyversebg.png')}
                style={tw`rounded-[16px] overflow-hidden`}
                imageStyle={tw`rounded-[16px]`}>
                <View
                  style={tw`rounded-[16px] p-5`}
                  // eslint-disable-next-line react-native/no-inline-styles
                  // semi-transparent dark overlay
                >
                  <View style={tw`absolute inset-0 bg-black opacity-40 rounded-[16px]`} />
                  {/* Header */}
                  <View style={tw`flex-row items-center mb-3`}>
                    <Image
                      source={require('../../assets/images/AIicon.png')}
                      style={tw`w-[28px] h-[28px] mr-2`}
                    />
                    <Text style={tw`text-white text-[15px] font-bold tracking-wide`}>
                      Daily Reflection
                    </Text>
                  </View>
                  {/* Verse Text */}
                  <Text
                    style={tw`text-white text-[14px] leading-[22px] italic mb-3`}>
                    "{dailyVerse.verse_text}"
                  </Text>
                  {/* Reference */}
                  <View style={tw`flex-row justify-end`}>
                    <Text style={tw`text-white text-[13px] font-semibold opacity-90`}>
                      — {dailyVerse.reference}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Ministry Assistant */}
          <View style={tw`mb-4 mt-2`}>
            <View style={tw`flex-row justify-between items-center mb-3`}>
              <View style={tw`flex-row items-center`}>
                <Image
                  source={require('../../assets/images/AIicon.png')}
                  style={tw`w-[17px] h-[17px] mr-1`}
                />
                <Text
                  style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                  Ministry Assistant
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleMinistryMoodPress(null)}>
                <Text
                  style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
                  Open chat {'>'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={tw`bg-[#F0F9FF] rounded-[16px] p-4`}>
              <Text
                style={tw`text-[14px] text-[#040641] font-semibold mb-1`}>
                How are you feeling today?
              </Text>
              <Text style={tw`text-[12px] text-[#64748B] mb-3`}>
                Tap a mood for personalized spiritual guidance
              </Text>
              <View style={tw`flex-row flex-wrap`}>
                {MINISTRY_MOOD_OPTIONS.map(mood => (
                  <TouchableOpacity
                    key={mood.id}
                    onPress={() => handleMinistryMoodPress(mood.content)}
                    style={tw`bg-white rounded-full px-3 py-[7px] m-1 border border-[#E2E8F0]`}>
                    <Text style={tw`text-[#040641] text-[13px]`}>
                      {mood.content}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={tw`px-4 py-2`}></View>
          {/* Hero Card - Live Churches or Events */}
          {/* {!heroCardLoading && heroCardData && (
            <HeroCard data={heroCardData} navigation={navigation} />
          )} */}

          {/* Your Churches Activity */}
          {/* <PlayerCards /> */}
          {/* <YourChurchesActivity /> */}
          {/* <Text>{convertEventTime('2025-02-12T00:00:00.000Z', 28800, 'America/New_York')}</Text> */}
          {/* <Text>{convertEventTime(startDate, startTime, eventTZ)}</Text> */}
          {addRequestForm && <ActivityModal />}
          {addMoreChurchesModal && <OtherLiveChurchModal />}
          {currentChurchModal && <CurrentChurchModal />}
          <NewsList />
          {/* Other Live Churches near you */}
          <LiveChurchesNearYou />

          {/*Picked for you, David!*/}
          <PickedForYou />

          {/*Digital Events you may attend, David*/}
          <EventsYouMayAttend />

          {/* Get Better Recommendations*/}
          <View style={tw`mb-6 mt-1`}>
            <LinearGradient
              colors={['#0077B6', '#90E0EF']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={tw`rounded-[12px] h-[182px] p-5`}>
              <Text
                style={tw`text-center text-[16px] text-white font-semibold`}>
                Shower some love today, {firstName}
              </Text>
              <View
                style={tw`h-[110px] bg-[#0077B6] mt-3 rounded-[12px] items-center`}>
                <Text style={tw`text-[11px] text-white mt-3 w-60  text-center`}>
                  HaH is a U.S. non-profit. We will always honor your gifts with
                  faithful stewardship, ethical practices, and transparency
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Give')}
                  style={tw`w-[150px] h-[33px] bg-white flex-row rounded-full justify-center items-center mt-2`}>
                  <Image
                    source={require('../../assets/images/hearticon.png')}
                    style={tw`w-5 h-5 mr-2`}
                  />
                  <Text
                    style={tw`text-[14px] text-[#040641]  font-semibold text-center`}>
                    View Projects
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {/*From HaH Community*/}
          <View style={tw`mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-[8px]`}>
              <View style={tw`flex-row`}>
                <Image
                  source={require('../../assets/images/communityicon.png')}
                  style={tw`w-[17px]  h-[17px] mr-1`}
                />
                <Text
                  style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                  From HaH Community
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Fellowship')}>
                <Text
                  style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
                  See all {'>'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
              Connect, Expand & Transform your Lives
            </Text>

            <View>
              <View style={tw`flex-row justify-between items-center mb-[8px]`}>
                <Text
                  style={tw`text-[14px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
                  Feed
                </Text>
                <TouchableOpacity
                  style={tw`flex-row`}
                  onPress={() => navigation.navigate('CreatePost')}>
                  <Text
                    style={tw`text-[14px] md:text-[14px] lg:text-[14px] text-[#0077B6] font-medium `}>
                    Write a Post
                  </Text>
                  <Image
                    source={require('../../assets/images/editicon.png')}
                    style={tw`w-[15px] h-[15px] ml-2`}
                  />
                </TouchableOpacity>
              </View>
              <Text
                style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
                Your Community Activity
              </Text>
            </View>

            {/*Feed*/}
            <Feed />
          </View>

          {/*Connect with Leaders*/}
          <ConnectWithLeaders />

          {/*Chat with Friends*/}
          <ChatWithFriends />

          {/* <SlideScreen /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navigator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    alignItems: 'center',
  },
  inputbar: {
    width: '90%',
    height: 48,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
    justifyContent: 'center',
    marginBottom: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginRight: 10,
  },
  resultsContainer: {
    backgroundColor: '#ffffff',
    width: '90%',
    maxHeight: '80%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
  },
  resultItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default TodayScreen;
