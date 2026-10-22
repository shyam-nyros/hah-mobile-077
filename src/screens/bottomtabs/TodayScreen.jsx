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
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, {Path} from 'react-native-svg';
import {SunIcon} from 'react-native-heroicons/outline';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
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
  useUpdateUserAPIMutation,
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
  setSelectedChurch,
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
import LeaderCollections from '../../components/today/LeaderCollections';
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
import {Platform, Linking} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import {useGetChurchesAPIQuery} from '../../features/churches/churchApiSlice';
import {useUpdateCurrentChurchOfTheUserMutation} from '../../features/auth/authApiSlice';
import useDebounce from '../../utils/customhooks/useDebounce';

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
  const {width: screenWidth} = useWindowDimensions();
  // card has px-4 (16px) inner padding + parent px-4 (16px) = 64px total horizontal padding
  const verseTextWidth = (screenWidth - 64) * 0.78;
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
  const [profileDismissed, setProfileDismissed] = useState(false);
  const [profileFirstName, setProfileFirstName] = useState('');
  const [profileLastName, setProfileLastName] = useState('');
  const [churchSearch, setChurchSearch] = useState('');
  const [profileChurchId, setProfileChurchId] = useState(null);
  const [profileChurchName, setProfileChurchName] = useState('');
  const [profileChurchAddress, setProfileChurchAddress] = useState('');
  const [churchDropdownFocus, setChurchDropdownFocus] = useState(false);
  const debouncedChurchSearch = useDebounce(churchSearch, 300);

  const [updateUserAPI, {isLoading: isUpdatingName}] =
    useUpdateUserAPIMutation();
  const [updateCurrentChurchOfTheUser, {isLoading: isUpdatingChurch}] =
    useUpdateCurrentChurchOfTheUserMutation();

  const {
    data: profileChurches,
    isLoading: churchSearchLoading,
    isFetching: churchSearchFetching,
  } = useGetChurchesAPIQuery(
    {search: debouncedChurchSearch},
    {skip: debouncedChurchSearch?.length < 5},
  );
  const isChurchSearching = churchSearchLoading || churchSearchFetching;

  // get user details — refetchOnMountOrArgChange ensures fresh data after login
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
    isFetching: userInfoIsFetching,
    isError: userInfoIsError,
  } = useUserDetailsQuery(undefined, {refetchOnMountOrArgChange: true});

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

  const handleProfileNameSubmit = async () => {
    if (!profileFirstName.trim() || !profileLastName.trim()) return;
    try {
      await updateUserAPI({
        first_name: profileFirstName.trim(),
        last_name: profileLastName.trim(),
        is_name_verified: true,
      }).unwrap();

      if (profileChurchId) {
        await updateCurrentChurchOfTheUser({
          church_id: profileChurchId,
        }).unwrap();
        dispatch(
          setSelectedChurch({
            id: profileChurchId,
            name: profileChurchName,
            address: profileChurchAddress,
          }),
        );
      }

      setProfileDismissed(true);
    } catch (e) {
      setProfileDismissed(true);
    }
  };

  const handleMinistryMoodPress = moodContent => {
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
      try {
        const permission = await notifee.requestPermission();
        // AuthorizationStatus: 1 = AUTHORIZED, 2 = PROVISIONAL
        if (
          permission?.authorizationStatus !== 1 &&
          permission?.authorizationStatus !== 2
        ) {
          return;
        }
        // iOS requires APNs registration before getToken() can return an FCM token
        if (Platform.OS === 'ios') {
          await messaging().registerDeviceForRemoteMessages();
        }
        const token = await messaging().getToken();
        if (token) {
          await registerFCMToken({
            token,
            platform: Platform.OS,
          }).unwrap();
        }
      } catch (error) {
        console.error('[FCM] Token registration failed:', error);
      }
    };

    fetchFCMToken();
  }, [registerFCMToken]);

  const DEFAULT_SOCIAL_FIRST_NAMES = ['apple', 'google', 'guest'];
  const hasDefaultSocialName = userInfo && (
    DEFAULT_SOCIAL_FIRST_NAMES.includes((userInfo.first_name || '').toLowerCase()) ||
    (userInfo.last_name || '').toLowerCase() === 'user'
  );

  return (
    <View style={tw`bg-white flex-1`}>
      <SafeAreaView style={tw`bg-[#0077B6] px-3`}>
        <NavHeaders title={'Home'} />
      </SafeAreaView>
      <ScrollView>
        {/** Body **/}
        <View style={tw`px-4 py-4`}>
          {/* ✅ Search Bar (now separate component like others) */}
          <View>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowSearchOverlay(true)}>
              <View
                style={tw`flex-row items-center h-9 px-2 rounded-full border border-[#E2E8F0]`}>
                <Image
                  source={require('../../assets/images/searchicon.png')}
                  style={tw`w-5 h-5 mr-1 tint-[#212529]`}
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

          {/* Daily Reflection + Ministry Assistant */}
          {dailyVerseLoading ? (
            /* Shimmer skeleton while verse loads */
            <View style={tw`mt-4 mb-4 bg-[#F1F5F9] rounded-[20px] p-4`}>
              {/* Header shimmer */}
              <View style={tw`flex-row items-center mb-4`}>
                <ShimmerPlaceholder
                  style={tw`w-12 h-12 rounded-full mr-3`}
                  shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                  LinearGradient={LinearGradient}
                />
                <View>
                  <ShimmerPlaceholder
                    style={tw`h-4 w-36 rounded-md mb-2`}
                    shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                    LinearGradient={LinearGradient}
                  />
                  <ShimmerPlaceholder
                    style={tw`h-3 w-44 rounded-md`}
                    shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                    LinearGradient={LinearGradient}
                  />
                </View>
              </View>
              {/* Verse card shimmer */}
              <ShimmerPlaceholder
                style={tw`w-full h-[120px] rounded-[16px] mb-4`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
              {/* Divider shimmer */}
              <ShimmerPlaceholder
                style={tw`w-full h-[1px] rounded mb-3`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
              {/* Mood title shimmer */}
              <ShimmerPlaceholder
                style={tw`h-4 w-48 rounded-md mb-2`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                style={tw`h-3 w-56 rounded-md mb-4`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
              {/* Mood chips shimmer — 2 rows of 3 */}
              <View style={tw`flex-row flex-wrap justify-between`}>
                {[...Array(6)].map((_, i) => (
                  <ShimmerPlaceholder
                    key={i}
                    style={tw`w-[31%] h-9 rounded-full mb-2`}
                    shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                    LinearGradient={LinearGradient}
                  />
                ))}
              </View>
            </View>
          ) : (
            <LinearGradient
              colors={['#F1F9FE', '#DFF0FD']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={tw`mt-4 mb-4 rounded-[20px] px-2 py-2 border border-[#CAE0F8]`}>
              {/* Header */}
              <View style={tw`flex-row items-center justify-between mb-3`}>
                <View style={tw`flex-row items-center`}>
                  <View>
                    <Image
                      source={require('../../assets/images/AIicon.png')}
                      style={tw`w-16 h-16`}
                    />
                  </View>
                  <View>
                    <Text style={tw`text-[#040641] font-semibold text-[15px]`}>
                      Daily Reflection
                    </Text>
                    <Text style={tw`text-[#64748B] text-[13px]`}>
                      Let God's Word guide your day.
                    </Text>
                  </View>
                </View>
                <View style={tw`self-start mt-3`}>
                  <SunIcon size={26} color="#0077B6" />
                </View>
              </View>

              {/* Verse Card */}
              {dailyVerse && (
                <View style={tw`rounded-[16px] overflow-hidden mb-3`}>
                  <ImageBackground
                    source={require('../../assets/images/dailyversebg.png')}
                    style={tw`w-full`}
                    imageStyle={tw`rounded-[16px]`}>
                    <View
                      style={[
                        tw`justify-center px-4 py-4`,
                        {backgroundColor: 'rgba(0,0,0,0.2)'},
                      ]}>
                      <Text style={[tw`text-white text-[14px] leading-[20px]`, {width: verseTextWidth}]}>
                        "{dailyVerse?.verse_text}"
                      </Text>
                      <Text style={tw`text-[#0D7ECF] text-[12px] mt-1`}>
                        — {dailyVerse?.reference}
                      </Text>
                    </View>
                  </ImageBackground>
                </View>
              )}

              {/* Divider */}
              <View style={tw`h-[1px] bg-[#CAE0F8] w-full my-2`} />

              {/* Mood Section */}
              <Text style={tw`text-[#040641] font-semibold text-[14px]`}>
                How are you feeling today?
              </Text>
              <Text style={tw`text-[#64748B] text-[12px] mb-3`}>
                Select how you feel to get relevant content.
              </Text>
              <View style={tw`flex-row flex-wrap justify-between`}>
                {MINISTRY_MOOD_OPTIONS.map(mood => (
                  <TouchableOpacity
                    key={mood.id}
                    onPress={() => handleMinistryMoodPress(mood.content)}
                    style={tw`w-[31%] bg-white rounded-full py-2 mb-2 border border-white/20 items-center`}>
                    <Text
                      style={tw`text-[#040641] font-semibold text-[13px] text-center`}>
                      {mood.content}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LinearGradient>
          )}
          {addRequestForm && <ActivityModal />}
          {addMoreChurchesModal && <OtherLiveChurchModal />}
          {currentChurchModal && <CurrentChurchModal />}

          {/* Complete Your Profile */}
          {userInfo && !profileDismissed && (!userInfo.is_name_verified || hasDefaultSocialName) && (
            <View style={styles.profileCard}>
              {/* X dismiss */}
              <TouchableOpacity
                style={styles.profileDismiss}
                onPress={() => setProfileDismissed(true)}>
                <Text style={styles.profileDismissText}>✕</Text>
              </TouchableOpacity>

              {/* Header row */}
              <View style={styles.profileHeader}>
                <View style={styles.profileAvatar}>
                  <Image
                    source={require('../../assets/images/placeholder.png')}
                    style={styles.profileAvatarImg}
                  />
                </View>
                <View style={styles.profileHeaderText}>
                  <Text style={styles.profileBadge}>Complete your profile</Text>
                  <Text style={styles.profileTitle}>
                    Add your name to continue
                  </Text>
                  <Text style={styles.profileSubtitle}>
                    So others can recognize you and personalize your experience.
                  </Text>
                </View>
              </View>

              {/* Inputs */}
              <TextInput
                style={styles.profileInput}
                placeholder="First Name"
                placeholderTextColor="#9A9EAE"
                value={profileFirstName}
                onChangeText={setProfileFirstName}
              />
              <TextInput
                style={styles.profileInput}
                placeholder="Last Name"
                placeholderTextColor="#9A9EAE"
                value={profileLastName}
                onChangeText={setProfileLastName}
              />

              {/* Church dropdown */}
              <Dropdown
                style={[
                  styles.profileDropdown,
                  churchDropdownFocus && styles.profileDropdownFocused,
                ]}
                placeholderStyle={styles.profileDropdownPlaceholder}
                selectedTextStyle={styles.profileDropdownSelected}
                inputSearchStyle={styles.profileDropdownSearch}
                iconStyle={styles.profileDropdownIcon}
                data={profileChurches || []}
                search
                maxHeight={220}
                labelField="name"
                valueField="_id"
                placeholder="Select Church (optional)"
                searchPlaceholder="Search church (min. 5 chars)"
                value={profileChurchId}
                onFocus={() => setChurchDropdownFocus(true)}
                onBlur={() => setChurchDropdownFocus(false)}
                onChangeText={txt => {
                  if (txt.length >= 5) setChurchSearch(txt);
                  else setChurchSearch('');
                }}
                onChange={item => {
                  setProfileChurchId(item._id);
                  setProfileChurchName(item.name);
                  setProfileChurchAddress(item.address || '');
                  setChurchDropdownFocus(false);
                }}
                renderRightIcon={() =>
                  isChurchSearching ? (
                    <ActivityIndicator size="small" color="#0077B6" />
                  ) : undefined
                }
                renderItem={item => (
                  <View style={styles.profileDropdownItem}>
                    <Text style={styles.profileDropdownItemName}>
                      {item.name}
                    </Text>
                    <Text style={styles.profileDropdownItemCity}>
                      {item.city ? item.city : '---'}
                    </Text>
                  </View>
                )}
              />

              {/* Continue button */}
              <TouchableOpacity
                style={[
                  styles.profileContinue,
                  (!profileFirstName.trim() || !profileLastName.trim()) &&
                    styles.profileContinueDisabled,
                ]}
                onPress={handleProfileNameSubmit}
                disabled={
                  !profileFirstName.trim() ||
                  !profileLastName.trim() ||
                  isUpdatingName ||
                  isUpdatingChurch
                }>
                {isUpdatingName || isUpdatingChurch ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.profileContinueText}>Continue</Text>
                )}
              </TouchableOpacity>

              {/* Not now */}
              <TouchableOpacity onPress={() => setProfileDismissed(true)}>
                <Text style={styles.profileNotNow}>Not now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* <NewsList /> */}
          {/* Leader Collections */}
          <LeaderCollections />
          {/* Other Live Churches near you */}
          <LiveChurchesNearYou />

          {/* Personalize Your Insights */}
          <LinearGradient
            colors={['#0077B6', '#90E0EF']}
            start={{x: 0, y: 0}} // top
            end={{x: 0, y: 1}} // bottom
            style={tw`rounded-[20px] p-6 mb-6 items-center`}>
            <Text style={tw`text-white text-[18px] font-bold text-center mb-3`}>
              Personalize Your Insights
            </Text>
            <Text
              style={tw`text-white text-[13px] text-center leading-[20px] mb-5 opacity-95`}>
              Let us learn about your spiritual interests so we can recommend
              content that uplift your mind and soul.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('GrowthGoals')}
              style={tw`bg-white rounded-full px-6 py-3 flex-row items-center`}>
              <Text style={tw`text-[#040641] text-[14px] font-semibold mr-2`}>
                Choose your journey
              </Text>
              <Text style={tw`text-[#040641] text-[14px] font-semibold`}>
                →
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/*Picked for you, David!*/}
          <PickedForYou />

          {/*Digital Events you may attend, David*/}
          <EventsYouMayAttend />

          {/* Shower Some Love Today */}
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

          {/*Chat with Friends*/}
          <ChatWithFriends />

          {/* Are You a Church Leader? */}
          <LinearGradient
            colors={['#5BC8E8', '#0096C7']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={tw`rounded-[20px] p-5 mb-6 flex-row items-center mt-5`}>
            <View style={tw`flex-1 mr-3`}>
              <Text style={tw`text-white text-[17px] font-bold mb-2`}>
                Are You a Church Leader?
              </Text>
              <Text
                style={tw`text-white text-[12px] leading-[18px] mb-4 opacity-90`}>
                Guide seekers. Be a light beyond walls transform lives and shape
                humanity.
              </Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL('https://heavenathand.org/churches')
                }
                style={tw`bg-white rounded-full px-4 py-2 flex-row items-center self-start`}>
                <Svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="#0096C7"
                  style={tw`mr-2`}>
                  <Path d="M5 16L3 5l5.5 5L12 2l3.5 8L21 5l-2 11H5zm0 3a1 1 0 000 2h14a1 1 0 000-2H5z" />
                </Svg>
                <Text style={tw`text-[#040641] text-[13px] font-semibold mr-1`}>
                  Claim Your Church
                </Text>
                <Text style={tw`text-[#040641] text-[13px] font-semibold`}>
                  →
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require('../../assets/images/claimchurch.png')}
              style={tw`w-[100px] h-[100px]`}
              resizeMode="contain"
            />
          </LinearGradient>

          {/*Connect with Leaders*/}
          <ConnectWithLeaders />

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

  /* ── Complete Your Profile card ── */
  profileCard: {
    borderWidth: 1,
    borderColor: '#CAE0F8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  profileDismiss: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  profileDismissText: {
    fontSize: 14,
    color: '#9A9EAE',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 24,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  profileAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  profileHeaderText: {
    flex: 1,
  },
  profileBadge: {
    fontSize: 13,
    color: '#0077B6',
    fontWeight: '500',
    marginBottom: 2,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  profileInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 12,
  },
  profileDropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  profileDropdownFocused: {
    borderColor: '#0077B6',
  },
  profileDropdownPlaceholder: {
    fontSize: 14,
    color: '#9A9EAE',
  },
  profileDropdownSelected: {
    fontSize: 14,
    color: '#040641',
  },
  profileDropdownSearch: {
    height: 40,
    fontSize: 14,
    color: '#040641',
  },
  profileDropdownIcon: {
    width: 20,
    height: 20,
  },
  profileDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  profileDropdownItemName: {
    fontSize: 14,
    color: '#040641',
  },
  profileDropdownItemCity: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileContinue: {
    height: 50,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileContinueDisabled: {
    opacity: 0.5,
  },
  profileContinueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  profileNotNow: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
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
