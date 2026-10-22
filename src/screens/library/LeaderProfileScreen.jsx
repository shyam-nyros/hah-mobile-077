import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  useFollowLeaderAPIMutation,
  useUnFollowLeaderAPIMutation,
} from '../../features/messages/messageApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useLeaderProfileAPIQuery} from '../../features/leaders/leadersApiSlice';
import tw from 'twrnc';
import {useDispatch} from 'react-redux';
import {setConversationIdNull} from '../../features/home/homeSlice';
import {
  useUserDetailsQuery,
  useUpdateUserAPIMutation,
} from '../../features/auth/authApiSlice';

import LoadingSpinner from '../../components/LoadingSpinner';
import ShareAppInSocialLinks from '../../components/feed/ShareAppInSocialLinks';


const LeaderProfileScreen = ({route, navigation}) => {
  const dispatch = useDispatch();
  const {leaderId} = route.params;

  const {
    data: leaderDetails,
    isLoading: leaderDetailsLoading,
    error: leaderDetailsError,
  } = useLeaderProfileAPIQuery(leaderId, {refetchOnMountOrArgChange: true});

  const [
    followLeaderAPI,
    {isLoading: followLeaderLoading, isError: followLeaderError},
  ] = useFollowLeaderAPIMutation();

  const [
    unFollowLeaderAPI,
    {isLoading: unFollowLeaderLoading, isError: unFollowLeaderError},
  ] = useUnFollowLeaderAPIMutation();

  // Name prompt sheet
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [nameFirst, setNameFirst] = useState('');
  const [nameLast, setNameLast] = useState('');
  const [pendingFollow, setPendingFollow] = useState(false);
  const {data: userInfo} = useUserDetailsQuery();
  const [updateUserAPI, {isLoading: isUpdatingName}] =
    useUpdateUserAPIMutation();

  const handleFollowLeader = async userId => {
    try {
      const response = await followLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  const handleUnFollowLeader = async userId => {
    try {
      const response = await unFollowLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  const handleFollowPress = () => {
    if (userInfo?.is_name_verified === false) {
      setPendingFollow(true);
      setShowNameSheet(true);
      return;
    }
    handleFollowLeader(leaderDetails?._id);
  };

  const handleNameSubmit = async () => {
    if (!nameFirst.trim() || !nameLast.trim()) return;
    try {
      await updateUserAPI({
        first_name: nameFirst.trim(),
        last_name: nameLast.trim(),
        is_name_verified: true,
      }).unwrap();
      setShowNameSheet(false);
      if (pendingFollow) {
        setPendingFollow(false);
        handleFollowLeader(leaderDetails?._id);
      }
    } catch (e) {}
  };

  // const handleChatNavigation = (
  //   userId,
  //   conversationId,
  //   firstName,
  //   lastName,
  //   profileImage,
  // ) => {
  //   if (leaderDetails?.isFollowing) {
  //     dispatch(setConversationIdNull());
  //     navigation.navigate('Chat', {
  //       recepientId: userId,
  //       conversationId: leaderDetails?.conversation
  //         ? leaderDetails?.conversation
  //         : null,
  //       name: `${firstName} ${lastName}`,
  //       profileImage,
  //       is_leader: true,
  //     });
  //   }
  // };

  const handleChatNavigation = (
    userId,
    conversationId,
    firstName,
    lastName,
    profileImage,
  ) => {
    navigation.navigate('Chat', {
      recepientId: userId,
      conversationId: conversationId,
      name: `${firstName} ${lastName}`,
      profileImage,
      is_leader: true,
    });
  };

  const [activeTab, setActiveTab] = useState('Videos');

  const [videoLibraries, setVideoLibraries] = useState([]);
  const [ebookLibraries, setEbookLibraries] = useState([]);
  const [audioLibraries, setAudioLibraries] = useState([]);

  const handleNavigation = (id, libraryType) => {
    if (libraryType === 'audio') {
      navigation.navigate('PodcastDetails', {libraryItemId: id});
    } else if (libraryType === 'video') {
      navigation.navigate('VideoDetails', {libraryItemId: id});
    } else if (libraryType === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: id});
    }
  };

  useEffect(() => {
    // Check if leader has libraries
    if (leaderDetails && leaderDetails?.libraries) {
      // Filter for ebooks and audio libraries
      const videos = leaderDetails?.libraries.find(lib => lib._id === 'video');
      const ebooks = leaderDetails?.libraries.find(lib => lib._id === 'ebook');
      const audios = leaderDetails?.libraries.find(lib => lib._id === 'audio');

      // Set the state with the respective libraries if available
      setVideoLibraries(videos ? videos.libraries : []);
      setEbookLibraries(ebooks ? ebooks.libraries : []);
      setAudioLibraries(audios ? audios.libraries : []);
    }
  }, [leaderDetailsLoading, leaderDetails]);

  //Videos
  const Videos = () => (
    <ScrollView style={tw`bg-white flex-1`}>
      {videoLibraries.length > 0 ? (
        <View style={tw`flex-row flex-wrap px-3 py-3`}>
          {videoLibraries.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleNavigation(item._id, 'video')}
              style={tw`w-1/3 px-1 mb-4`}>
              <Image
                source={{uri: item.cover_image}}
                style={[tw`w-full rounded-xl bg-[#d9d9d9]`, {aspectRatio: 1}]}
              />
              <Text
                numberOfLines={2}
                style={tw`text-[#0077B6] font-medium text-[11px] mt-1`}>
                {item.title}
              </Text>
              <Text style={tw`text-[#040641] text-[10px] mt-[1px]`}>
                {item?.author?.first_name || 'N/A'}
                {item?.author?.last_name ? ` ${item.author.last_name}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={tw`flex-1 justify-center items-center py-10`}>
          <Text style={tw`text-[#040641] text-[12px]`}>
            No content available
          </Text>
        </View>
      )}
    </ScrollView>
  );

  //PodCasts
  const PodCasts = () => (
    <ScrollView style={tw`bg-white flex-1`}>
      {audioLibraries.length > 0 ? (
        <View style={tw`flex-row flex-wrap px-3 py-3`}>
          {audioLibraries.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleNavigation(item._id, 'audio')}
              style={tw`w-1/3 px-1 mb-4`}>
              <Image
                source={{uri: item.cover_image}}
                style={[tw`w-full rounded-xl bg-[#d9d9d9]`, {aspectRatio: 1}]}
              />
              <Text
                numberOfLines={2}
                style={tw`text-[#0077B6] font-medium text-[11px] mt-1`}>
                {item.title}
              </Text>
              <Text style={tw`text-[#040641] text-[10px] mt-[1px]`}>
                {item?.author?.first_name || 'N/A'}
                {item?.author?.last_name ? ` ${item.author.last_name}` : ''}
              </Text>
              <Text style={tw`text-[#040641] font-medium text-[10px] mt-[1px]`}>
                View full podcast
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={tw`flex-1 justify-center items-center py-10`}>
          <Text style={tw`text-[#040641] text-[12px]`}>
            No content available
          </Text>
        </View>
      )}
    </ScrollView>
  );

  //Books
  const Books = () => (
    <ScrollView style={tw`bg-white flex-1`}>
      {ebookLibraries.length > 0 ? (
        <View style={tw`flex-row flex-wrap px-3 py-3`}>
          {ebookLibraries.map(item => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleNavigation(item._id, 'ebook')}
              style={tw`w-1/3 px-1 mb-4`}>
              <Image
                source={{uri: item.cover_image}}
                style={[tw`w-full rounded-xl bg-[#d9d9d9]`, {aspectRatio: 1}]}
              />
              <Text
                numberOfLines={2}
                style={tw`text-[#0077B6] font-medium text-[11px] mt-1`}>
                {item.title}
              </Text>
              <Text style={tw`text-[#040641] text-[10px] mt-[1px]`}>
                {item?.author?.first_name || 'N/A'}
                {item?.author?.last_name ? ` ${item.author.last_name}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={tw`flex-1 justify-center items-center py-10`}>
          <Text style={tw`text-[#040641] text-[12px]`}>
            No content available
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderShimmerPlaceholder = () => (
    <View>
      <View style={tw`flex-row items-center gap-4 mb-4`}>
        <ShimmerPlaceholder
          LinearGradient={LinearGradient}
          style={tw`ml-3 mt-3 w-22 h-22 rounded-full`}
        />
        <View>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-60 h-4 mt-4 mb-2 rounded-md`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-40 h-4  rounded-md`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-40 h-4 mt-3 rounded-md`}
          />
        </View>
      </View>

      {/* Cards Section Placeholder */}
      <View style={tw`mt-7 flex-row`}>
        {Array.from({length: 3}).map((_, index) => (
          <View key={index} style={tw` rounded-lg p-4 mx-4 mb-4`}>
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={tw`w-20 h-20 rounded-md mb-3`}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <>
      {/* Header */}
      <SafeAreaView style={tw`bg-[#0077B6]`}>
        <TouchableOpacity
          style={tw`mx-2 flex-row  py-4 items-center`}
          onPress={() => navigation.goBack()}>
          <View>
            <Image
              source={require('../../assets/images/chevronlefticon.png')}
              style={tw`w-[26px] h-[26px]`}
            />
          </View>
          <Text style={tw`text-xl text-[#fff] font-medium`}>Leaders</Text>
        </TouchableOpacity>
      </SafeAreaView>
      {/* <ScrollView style={tw`bg-white`}> */}
      {/** Body **/}

      {/** leader Details **/}
      {leaderDetailsLoading ? (
        renderShimmerPlaceholder()
      ) : leaderDetailsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Failed to load leader details</Text>
        </View>
      ) : (
        <>
          <View style={tw`bg-white `}>
            <View style={tw`mt-5 mx-3`}>
              {/* Profile  */}
              <View style={tw`flex-row items-center`}>
                <View>
                  <Image
                    source={require('../../assets/images/leadersframe.png')}
                    style={tw`w-26 h-26`}
                  />

                  <Image
                    source={{uri: leaderDetails.profile_image}}
                    // source={require('../../assets/images/leaderimage1.png')}
                    style={tw`w-19 h-19 absolute rounded-full top-[14px] left-[14px]`}
                  />

                  {leaderDetails.featured && (
                    <Image
                      source={require('../../assets/images/profilebadge.png')}
                      style={tw`w-[16px] h-[17px] absolute top-[86px] right-[4px]`}
                    />
                  )}
                </View>
                <View style={tw`ml-2 flex-1`}>
                  <Text style={tw`text-[#0077B6] font-semibold text-[18px]`}>
                    {/* Samuel Rodriguez */}
                    {leaderDetails &&
                      `${leaderDetails?.first_name} ${leaderDetails?.last_name}`}
                  </Text>
                  <Text
                    style={tw`text-[#040641] font-medium text-[13px]  mb-2`}
                    numberOfLines={1}>
                    {/* Senior Pastor jobs */}
                    {leaderDetails?.jobs ? leaderDetails?.jobs : 'N/A'}
                  </Text>
                  <View style={tw`flex-row justify-between w-53`}>
                    <View style={tw`flex-row items-center`}>
                      <Image
                        source={require('../../assets/images/followersicon.png')}
                        style={tw`w-3 h-3`}
                      />
                      <Text style={tw`text-[#040641]  text-[12px] ml-1`}>
                        {leaderDetails?.followers_count}
                      </Text>
                      <Text style={tw`text-[#040641]  text-[12px] ml-1`}>
                        followers
                      </Text>
                    </View>
                    <View style={tw`flex-row items-center`}>
                      <Image
                        source={require('../../assets/images/guidesicon.png')}
                        style={tw`w-3 h-3`}
                      />
                      <Text style={tw`text-[#040641]  text-[12px] ml-1`}>
                        {leaderDetails?.guides}
                      </Text>
                      <Text style={tw`text-[#040641]  text-[12px] ml-1`}>
                        guides
                      </Text>
                    </View>
                  </View>

                  {/*Following Leaders*/}
                  <View
                    style={tw`flex-row gap-2 items-center justify-between flex-1 mt-2`}>
                    {leaderDetails?.isFollowing ? (
                      <TouchableOpacity
                        onPress={async () => {
                          await handleUnFollowLeader(leaderDetails?._id);
                        }}
                        style={tw`flex-1  h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <Image
                          source={require('../../assets/images/followbellicon.png')}
                          style={tw`w-3 h-3`}
                        />
                        <Text style={tw`text-[#0077B6] text-[12px] ml-1`}>
                          Unfollow
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={handleFollowPress}
                        style={tw`flex-1 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <Image
                          source={require('../../assets/images/followbellicon.png')}
                          style={tw`w-3.5 h-3.5`}
                        />
                        <Text style={tw`text-[#0077B6] text-[12px] g`}>
                          Follow
                        </Text>
                      </TouchableOpacity>
                    )}
                    {leaderDetails?.conversation && (
                      <View
                        style={tw`w-10 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <TouchableOpacity
                          onPress={() =>
                            handleChatNavigation(
                              leaderDetails?._id,
                              leaderDetails?.conversation,
                              leaderDetails?.first_name,
                              leaderDetails?.last_name,
                              leaderDetails?.profile_image,
                            )
                          }>
                          <Image
                            source={require('../../assets/images/message2icon.png')}
                            style={tw`w-4 h-4`}
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {/* {leaderDetails?.conversation && (
                      <TouchableOpacity
                        onPress={() =>
                          handleChatNavigation(
                            leaderDetails?._id,
                            leaderDetails?.conversation,
                            leaderDetails?.first_name,
                            leaderDetails?.last_name,
                            leaderDetails?.profile_image,
                          )
                        }>
                        <Image
                          source={require('../../assets/images/message2icon.png')}
                          style={tw`w-4 h-4 ${
                            leaderDetails?.isFollowing ? '' : 'opacity-50' // Mute icon color when not following
                          }`}
                        />
                        <Text
                          style={tw`text-[#0077B6] text-[12px] ml-1 ${
                            leaderDetails?.isFollowing ? '' : 'opacity-50' // Mute text color when not following
                          }`}>
                          Message
                        </Text>
                      </TouchableOpacity>
                    )} */}
                    {/* {followLeaderLoading || unFollowLeaderLoading ? (
                      <TouchableOpacity
                        style={tw`w-20 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <LoadingSpinner size={'small'} />
                      </TouchableOpacity>
                    ) : leaderDetails?.isFollowing ? (
                      <TouchableOpacity
                        onPress={async () => {
                          await handleUnFollowLeader(leaderDetails?._id);
                        }}
                        style={tw`flex-1  h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <Image
                          source={require('../../assets/images/followbellicon.png')}
                          style={tw`w-3 h-3`}
                        />
                        <Text style={tw`text-[#0077B6] text-[12px] ml-1`}>
                          Unfollow
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={async () => {
                          // Trigger follow action and update leader state
                          await handleFollowLeader(leaderDetails?._id);
                        }}
                        style={tw`flex-1 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                        <Image
                          source={require('../../assets/images/followbellicon.png')}
                          style={tw`w-3.5 h-3.5`}
                        />
                        <Text style={tw`text-[#0077B6] text-[12px] g`}>
                          Follow
                        </Text>
                      </TouchableOpacity>
                    )} */}

                    {/* <TouchableOpacity
                      disabled={!leaderDetails?.isFollowing} // Disables button when not following
                      onPress={() =>
                        handleChatNavigation(
                          leaderDetails?._id,
                          leaderDetails?.conversation?._id
                            ? leaderDetails?.conversation?._id
                            : null,
                          leaderDetails?.first_name,
                          leaderDetails?.last_name,
                          leaderDetails?.profile_image,
                        )
                      }
                      style={tw`flex-1 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center ${
                        leaderDetails?.isFollowing ? '' : 'opacity-20' // Muted color when not following
                      }`}>
                      <Image
                        source={require('../../assets/images/message2icon.png')}
                        style={tw`w-4 h-4 ${
                          leaderDetails?.isFollowing ? '' : 'opacity-50' // Mute icon color when not following
                        }`}
                      />
                      <Text
                        style={tw`text-[#0077B6] text-[12px] ml-1 ${
                          leaderDetails?.isFollowing ? '' : 'opacity-50' // Mute text color when not following
                        }`}>
                        Message
                      </Text>
                    </TouchableOpacity> */}

                    {/* <TouchableOpacity
                      style={tw`w-10 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                      <Image
                        source={require('../../assets/images/share2icon.png')}
                        style={tw`w-4 h-4`}
                      />
                    </TouchableOpacity> */}
                    <View
                      style={tw`w-10 h-7 border-[#0077B6] border-[1px] rounded-[8px] flex-row items-center justify-center`}>
                      <ShareAppInSocialLinks leader={true} />
                    </View>
                  </View>
                </View>
              </View>
              {/* About */}
              <View>
                <Text style={tw`text-[#040641] opacity-70 text-[12px] mt-4`}>
                  {leaderDetails?.about
                    ? leaderDetails?.about
                    : `Hey there this is Leader  ${leaderDetails?.first_name} ${leaderDetails?.last_name}`}
                </Text>
              </View>
              {/* Profile Top Tabs */}
            </View>
          </View>

          <View style={tw`bg-white flex-1`}>
            {/* Custom Tab Bar */}
            <View style={tw`flex-row bg-white`}>
              {['Videos', 'Podcasts', 'Books'].map(tab => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={tw`flex-1 items-center py-3`}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '500',
                      color: activeTab === tab ? '#040641' : 'rgba(4, 6, 41, 0.5)',
                    }}>
                    {tab}
                  </Text>
                  {activeTab === tab && (
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '40%',
                        height: 2,
                        backgroundColor: '#040641',
                        borderRadius: 10,
                      }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <View style={tw`flex-1`}>
              {activeTab === 'Videos' && <Videos />}
              {activeTab === 'Podcasts' && <PodCasts />}
              {activeTab === 'Books' && <Books />}
            </View>
          </View>
        </>
      )}

      {/* Name prompt bottom sheet */}
      <Modal
        visible={showNameSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameSheet(false)}>
        <View style={nameStyles.sheetOverlay}>
          <View style={nameStyles.sheet}>
            <View style={nameStyles.sheetHandle} />
            <View style={nameStyles.sheetAvatarRow}>
              <View style={nameStyles.sheetAvatar}>
                <Image
                  source={require('../../assets/images/placeholder.png')}
                  style={nameStyles.sheetAvatarImg}
                />
              </View>
            </View>
            <Text style={nameStyles.sheetTitle}>Add your name to follow</Text>
            <Text style={nameStyles.sheetSubtitle}>
              Your name will be shown when you follow a leader so others can
              know and connect with you.
            </Text>
            <TextInput
              style={nameStyles.sheetInput}
              placeholder="First Name"
              placeholderTextColor="#9A9EAE"
              value={nameFirst}
              onChangeText={setNameFirst}
            />
            <TextInput
              style={nameStyles.sheetInput}
              placeholder="Last Name"
              placeholderTextColor="#9A9EAE"
              value={nameLast}
              onChangeText={setNameLast}
            />
            <TouchableOpacity
              style={[
                nameStyles.sheetButton,
                (!nameFirst.trim() || !nameLast.trim()) &&
                  nameStyles.sheetButtonDisabled,
              ]}
              onPress={handleNameSubmit}
              disabled={
                !nameFirst.trim() || !nameLast.trim() || isUpdatingName
              }>
              {isUpdatingName ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={nameStyles.sheetButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setPendingFollow(false);
                setShowNameSheet(false);
              }}>
              <Text style={nameStyles.sheetNotNow}>Not now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const nameStyles = StyleSheet.create({
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D0D3DC',
    marginBottom: 20,
  },
  sheetAvatarRow: {
    marginBottom: 14,
  },
  sheetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DFF0FD',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sheetAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 20,
  },
  sheetInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#040641',
    marginBottom: 14,
  },
  sheetButton: {
    height: 52,
    borderRadius: 30,
    backgroundColor: '#0077B6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  sheetButtonDisabled: {
    opacity: 0.5,
  },
  sheetButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  sheetNotNow: {
    textAlign: 'center',
    color: '#0077B6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LeaderProfileScreen;
