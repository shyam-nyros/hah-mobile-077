import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import tw from 'twrnc';
import {
  useFeedListAPIQuery,
  useRefreshDataOnUserDeletedQuery,
} from '../../features/feed/feedApiSlice';

import LoadingSpinner from '../LoadingSpinner';
import PostItem from './PostItem';
import {useNavigation} from '@react-navigation/native';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useSelector} from 'react-redux';

const FellowshipFeedTab = () => {
  const navigation = useNavigation();
  const [currentPage, setCurrentPage] = useState(1); // track current page
  const [refreshinghFeed, setrefreshingFeed] = useState(false); // pull to refresh feed - flat list

  const {reloadFlagForBlockUser} = useSelector(state => state.feed);

  // Fetch feed list based on currentPage
  const {
    data: feed,
    isLoading: feedIsLoading,
    isFetching: feedIsFetching,
    isError: feedtIsError,
    error: feedErr,
    refetch,
  } = useFeedListAPIQuery(currentPage);
  useRefreshDataOnUserDeletedQuery();

  // navigate to createe post screen
  const navigateToNextScreen = () => {
    navigation.navigate('CreatePost');
  };

  // when a user is blocked then reload the feed
  useEffect(() => {
    setCurrentPage(1);
    refetch();
  }, [reloadFlagForBlockUser]);

  // when pulled reset the feed by setting current page as 1
  // and update state refreshing to true
  const handleRefresh = () => {
    refetch();
    setCurrentPage(1);
    setrefreshingFeed(true);
  };

  // when flat list reaches the bottom then increment the current page
  const handleEndReached = () => {
    if (feed?.hasMore && !feedIsFetching) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // when pulled - trigger refresh and after that reset the refreshing state to false
  useEffect(() => {
    if (!feedIsFetching) {
      setrefreshingFeed(false);
    }
  }, [feedIsFetching, feed, feedtIsError, refreshinghFeed]);

  const [visibleItems, setVisibleItems] = useState([]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% visible
    minimumViewTime: 300, // Item must be visible for at least 300ms
  }).current;

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    // Update the state with currently visible item IDs
    const visibleItemIds = viewableItems.map(item => item.item._id);
    setVisibleItems(visibleItemIds);
  }).current;

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 mt-8 gap-3 justify-between`}>
      {[...Array(5)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          style={tw` h-[290px] w-full rounded-7`}
          shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
          LinearGradient={LinearGradient}
        />
      ))}
    </View>
  );

  return (
    <>
      {feedIsLoading ? (
        renderShimmerPlaceholder()
      ) : feedtIsError ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>Failed to load posts</Text>
        </View>
      ) : (
        <>
          <View style={tw`bg-white flex-1 pb-4`}>
            <View style={tw`mt-4 mb-6`}>
              <Text
                style={tw`text-[#040641] text-[18px] mx-4 font-semibold mb-3`}>
                Posts
              </Text>
              {feed && feed?.list?.length > 0 && (
                <FlatList
                  data={feed?.list}
                  keyExtractor={item => String(item._id)}
                  refreshing={refreshinghFeed}
                  onRefresh={handleRefresh}
                  onEndReached={handleEndReached}
                  onEndReachedThreshold={0.4}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{gap: 16, paddingHorizontal: 16}}
                  renderItem={({item}) => (
                    <PostItem
                      postInfo={item}
                      isItemVisible={visibleItems.includes(item._id)}
                    />
                  )}
                  viewabilityConfig={viewabilityConfig}
                  onViewableItemsChanged={onViewableItemsChanged}
                  ListFooterComponent={
                    <View>
                      {!feedIsFetching && feed?.list?.length === 0 && (
                        <Text style={tw`text-center text-black`}>
                          No posts available
                        </Text>
                      )}
                      {feedIsFetching && (
                        <View style={{marginBottom: 60}}>
                          <LoadingSpinner color="blue" size="small" />
                        </View>
                      )}
                      {!feed?.hasMore && !feedIsFetching && (
                        <Text style={tw`text-center text-gray-500 mb-10`}>
                          No more posts to load
                        </Text>
                      )}
                    </View>
                  }
                />
              )}
            </View>
            {/* Floating Button */}
            <TouchableOpacity
              onPress={navigateToNextScreen}
              style={tw`absolute bottom-10 right-5 bg-[#99E1EF] rounded-full w-12 h-12 justify-center items-center shadow-lg`}>
              <Image
                source={require('../../assets/images/editposticon.png')}
                style={tw`w-5 h-5`}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </>
  );
};

export default FellowshipFeedTab;

const styles = StyleSheet.create({
  inputbar: {
    width: '100%',
    height: 38,
    backgroundColor: '#fff',
    borderRadius: 100,
    marginTop: 16,
    justifyContent: 'center',
  },
});
