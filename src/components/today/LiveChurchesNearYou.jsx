import React, {useEffect, useRef, useState} from 'react';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Animated,
  useWindowDimensions,
  Alert,
} from 'react-native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {convertEventTime} from '../../utils/formattedDate';
import {useOtherLiveChurchesNearYouAPIQuery} from '../../features/home/homeApiSlice';
import {
  useAddAnotherChurchAPIMutation,
  useDeleteAnotherChurchAPIMutation,
} from '../../features/auth/authApiSlice';
import {
  setFollowedChurches,
  removeItemFromFollowedChurchList,
} from '../../features/auth/authSlice';
import tw from 'twrnc';
import {useSelector, useDispatch} from 'react-redux';

const LiveChurchesNearYou = () => {
  const {followedChurchesIdsToFilter} = useSelector(state => state.home);
  const {followedChurchList} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();

  // parent container has px-4 (16px each side = 32px); card fills full available width
  const CARD_MARGIN = 16;
  const CARD_WIDTH = screenWidth - 32;
  const ITEM_WIDTH = CARD_WIDTH + CARD_MARGIN;
  // ~21% of screen height keeps the card proportional across all device sizes
  const CARD_HEIGHT = Math.floor(screenHeight * 0.21);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredLiveChurches, setFilteredLiveChurches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [followingChurchId, setFollowingChurchId] = useState(null);
  const [unfollowingChurchId, setUnfollowingChurchId] = useState(null);

  const [addAnotherChurchAPI] = useAddAnotherChurchAPIMutation();
  const [deleteAnotherChurchAPI] = useDeleteAnotherChurchAPIMutation();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems?.length > 0 && viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const scrollToIndex = idx => {
    flatListRef.current?.scrollToIndex({animated: true, index: idx});
    setActiveIndex(idx);
  };

  const {
    data: otherLiveChurchList,
    isLoading: liveChurchesLoading,
    isFetching: liveChurchesFetching,
    error: liveChurchesError,
  } = useOtherLiveChurchesNearYouAPIQuery();

  const handleChurchDetails = (liveChurchId, churchId) => {
    navigation.navigate('LiveChurchDetails', {liveChurchId, churchId});
  };

  const handleFollow = async churchId => {
    if (followedChurchList.some(c => c._id === churchId)) return;
    if (followedChurchList.length >= 10) {
      Alert.alert('Limit Reached', 'You can follow up to 10 churches.');
      return;
    }
    setFollowingChurchId(churchId);
    try {
      const response = await addAnotherChurchAPI({church: churchId}).unwrap();
      dispatch(setFollowedChurches(response.following_churches));
    } catch {
      Alert.alert('Error', 'Failed to follow church. Please try again.');
    } finally {
      setFollowingChurchId(null);
    }
  };

  const handleUnfollow = async churchId => {
    setUnfollowingChurchId(churchId);
    try {
      await deleteAnotherChurchAPI({church: churchId}).unwrap();
      dispatch(removeItemFromFollowedChurchList({id: churchId}));
    } catch {
      Alert.alert('Error', 'Failed to unfollow church. Please try again.');
    } finally {
      setUnfollowingChurchId(null);
    }
  };

  const getCoverImage = item => {
    if (item?.aigenerated && item?.ai_cover_image) {
      return {uri: item.ai_cover_image};
    }
    if (!item?.aigenerated && item?.cover_image?.path) {
      return {uri: item.cover_image.path};
    }
    return require('../../assets/images/livechurchplaceholder.png');
  };

  const getChurchName = item => {
    if (item?.church?.name) return item.church.name;
    if (item?.organization?.name) return item.organization.name;
    return '';
  };

  const getCity = item => {
    if (item?.church?.city) return item.church.city;
    if (item?.organization?.city) return item.organization.city;
    return '';
  };

  useEffect(() => {
    if (!liveChurchesLoading && otherLiveChurchList) {
      const result = otherLiveChurchList.filter(
        item => !followedChurchesIdsToFilter.includes(item._id),
      );
      setFilteredLiveChurches(result);
    }
  }, [
    liveChurchesLoading,
    liveChurchesFetching,
    otherLiveChurchList,
    followedChurchesIdsToFilter,
  ]);

  const renderItem = ({item}) => {
    const isLive = item?.overallStatus === 'inprogress';
    const churchId = item?.church ? item?.church?._id : item?.organization?._id;
    const isAlreadyFollowed = followedChurchList.some(c => c._id === churchId);
    const isFollowLoading = followingChurchId === churchId;
    const isUnfollowLoading = unfollowingChurchId === churchId;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleChurchDetails(item?._id, churchId)}
        style={[tw`mr-4 rounded-[20px] overflow-hidden`, {width: CARD_WIDTH, height: CARD_HEIGHT}]}>
        {/* Background Image */}
        <Image
          source={getCoverImage(item)}
          style={tw`w-full h-full absolute`}
          resizeMode="cover"
        />

        {/* Dark Overlay */}
        {/* <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']}
          style={tw`absolute inset-0`}
        /> */}
        <LinearGradient
          colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0)']}
          start={{x: 0, y: 0}}
          end={{x: 0.8, y: 0}} // fade stops early → no right darkening
          style={tw`absolute inset-0`}
        />

        {/* Top Badge — same icon & style as LiveChurchList */}
        {isLive && (
          <View style={styles.liveBadge}>
            <Image
              source={require('../../assets/images/liveiconred.png')}
              style={styles.liveIcon}
            />
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}

        {/* Content */}
        <View style={tw`flex-1 justify-end p-4`}>
          {/* Title */}
          <Text
            numberOfLines={1}
            style={tw`text-white text-[16px] font-bold`}>
            {item.title}
          </Text>

          {/* Time */}
          <Text style={tw`text-white/80 text-[12px] mt-1`}>
            {convertEventTime(
              item?.start_date,
              item?.slotInfo?.start_time,
              item?.timezone?.tzCode,
            )}
          </Text>

          {/* Church + City */}
          <Text style={tw`text-white/80 text-[12px] mt-1`}>
            {getChurchName(item)} • {getCity(item)}
          </Text>

          {/* Bottom Row */}
          <View style={tw`flex-row items-center justify-between mt-3`}>
            {/* Attendees */}
            <View style={tw`flex-row items-center`}>
              <Image
                source={require('../../assets/images/placeholder.png')}
                style={tw`w-[18px] h-[18px] rounded-full border border-white -mr-2`}
              />
              <Image
                source={require('../../assets/images/placeholder.png')}
                style={tw`w-[18px] h-[18px] rounded-full border border-white -mr-2`}
              />
              <Image
                source={require('../../assets/images/placeholder.png')}
                style={tw`w-[18px] h-[18px] rounded-full border border-white mr-2`}
              />
              <Text style={tw`text-white text-[12px]`}>
                {item?.attendeesCount || 0} attending
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={tw`flex-row items-center gap-2`}>
              {/* Follow / Unfollow Button */}
              <TouchableOpacity
                onPress={() =>
                  isAlreadyFollowed
                    ? handleUnfollow(churchId)
                    : handleFollow(churchId)
                }
                disabled={isFollowLoading || isUnfollowLoading}
                style={tw`rounded-full overflow-hidden`}>
                <LinearGradient
                  colors={
                    isAlreadyFollowed
                      ? ['#EF4444', '#DC2626']
                      : ['#48CAE4', '#0096C7']
                  }
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={tw`px-4 py-2`}>
                  <Text style={tw`text-white text-[12px] font-semibold`}>
                    {isFollowLoading || isUnfollowLoading
                      ? '...'
                      : isAlreadyFollowed
                      ? 'Unfollow'
                      : 'Follow'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Join Button */}
              <TouchableOpacity
                onPress={() => handleChurchDetails(item?._id, churchId)}
                style={tw`rounded-full overflow-hidden`}>
                <LinearGradient
                  colors={['#48CAE4', '#0096C7']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={tw`px-5 py-2`}>
                  <Text style={tw`text-white text-[12px] font-semibold`}>
                    Join
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderShimmer = () => (
    <ShimmerPlaceholder
      style={[{width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20}]}
      shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
      LinearGradient={LinearGradient}
    />
  );

  return (
    <View style={tw`mb-6`}>
      {/* Section Header */}
      <View style={tw`flex-row justify-between items-center mb-[6px]`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('../../assets/images/churchicon2.png')}
            style={tw`w-[17px] h-[17px] mr-1`}
          />
          <Text
            style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
            Live Churches
          </Text>
          {otherLiveChurchList?.length === 0 && (
            <TouchableOpacity
              style={tw`ml-1 justify-center items-center`}
              onPress={() => setModalVisible(true)}>
              <Image
                source={require('../../assets/images/infoicon.png')}
                style={tw`w-4 h-4`}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Livechurch')}>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-[13px] text-[#040641] opacity-70 mb-4`}>
        Join Uplifting Live Church Services Happening Now
      </Text>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View
            style={tw`flex-1 justify-center items-center bg-gray-500 bg-opacity-30 px-4`}>
            <TouchableWithoutFeedback>
              <View style={tw`w-full bg-white rounded-[10px] p-4`}>
                <View style={tw`flex-row items-center gap-1 mb-2`}>
                  <Image
                    source={require('../../assets/images/infoicon.png')}
                    style={tw`w-6 h-6`}
                  />
                  <Text style={tw`text-[#040641] text-[16px] font-semibold`}>
                    Details
                  </Text>
                </View>
                <Text
                  style={tw`text-[#040641] text-[14px] tracking-normal leading-5`}>
                  There is no data available for your church and the churches
                  you follow, so you are viewing churches from across the globe.
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Content */}
      {liveChurchesLoading || liveChurchesFetching ? (
        renderShimmer()
      ) : liveChurchesError ? (
        <View style={tw`mb-4 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load live churches</Text>
        </View>
      ) : otherLiveChurchList?.length === 0 ? (
        <View style={tw`mb-4 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No Live Church Activities</Text>
        </View>
      ) : (
        <View>
          <FlatList
            ref={flatListRef}
            data={filteredLiveChurches}
            keyExtractor={item => item._id}
            horizontal
            snapToInterval={ITEM_WIDTH}
            snapToAlignment="start"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingRight: CARD_MARGIN}}
            renderItem={renderItem}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {x: scrollX}}}],
              {useNativeDriver: false},
            )}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            scrollEventThrottle={16}
            onScrollToIndexFailed={info => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
          />

          {/* Dots pagination */}
          {filteredLiveChurches.length > 1 && (
            <View style={styles.dotsContainer}>
              {filteredLiveChurches.map((_, idx) => {
                const inputRange = [
                  (idx - 1) * ITEM_WIDTH,
                  idx * ITEM_WIDTH,
                  (idx + 1) * ITEM_WIDTH,
                ];
                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 20, 8],
                  extrapolate: 'clamp',
                });
                const bgColor = scrollX.interpolate({
                  inputRange,
                  outputRange: ['#CBD5E1', '#040641', '#CBD5E1'],
                  extrapolate: 'clamp',
                });
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => scrollToIndex(idx)}
                    hitSlop={{top: 8, bottom: 8, left: 4, right: 4}}>
                    <Animated.View
                      style={[
                        styles.dot,
                        {width: dotWidth, backgroundColor: bgColor},
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    height: 6,
    borderRadius: 60,
    marginHorizontal: 3,
  },
  liveBadge: {
    flexDirection: 'row',
    backgroundColor: 'red',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 20,
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1,
  },
  liveIcon: {
    width: 14,
    height: 14,
    marginRight: 3,
    tintColor: 'white',
  },
  liveText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
  },
});

export default LiveChurchesNearYou;
