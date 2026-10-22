import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import {useRoute, useNavigation} from '@react-navigation/native';
import {
  useNewsItemViewedAPIMutation,
  useNewsAPIQuery,
} from '../../features/home/homeApiSlice';
import {useNewsDetailsAPIQuery} from '../../features/home/homeApiSlice';
import TimeAgo from '../../components/messages/TimeAgo';

const {width: screenWidth} = Dimensions.get('window');

const NewsDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {newsId} = route.params;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSwipeGuide, setShowSwipeGuide] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const {data: allNewsItems} = useNewsAPIQuery();
  const {data: currentNews, isLoading, error} = useNewsDetailsAPIQuery(newsId);
  const [markNewsAsViewed] = useNewsItemViewedAPIMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setShowSwipeGuide(false));
    }, 4000);
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  useEffect(() => {
    if (allNewsItems && newsId) {
      const index = allNewsItems.findIndex(item => item._id === newsId);
      if (index !== -1) {
        setCurrentIndex(index);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: false,
          });
        }, 100);
      }
    }
  }, [allNewsItems, newsId]);

  useEffect(() => {
    if (newsId) {
      markNewsAsViewed(newsId);
    }
  }, [newsId]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index;
      const newNewsId = viewableItems[0].item._id;
      setCurrentIndex(newIndex);
      markNewsAsViewed(newNewsId);
      navigation.setParams({newsId: newNewsId});
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderNewsItem = ({item}) => {
    return (
      <ScrollView
        style={{width: screenWidth}}
        contentContainerStyle={tw`bg-white`}
        showsVerticalScrollIndicator={true}>
        <View style={styles.image}>
          <Image
            source={
              item.aigenerated && item.ai_cover_image
                ? {uri: item.ai_cover_image}
                : item.cover_image?.path
                ? {uri: item.cover_image.path}
                : require('../../assets/images/defaults/eventslarge.png')
            }
            style={styles.image}
            resizeMode="cover"
          />

          {/* Back Button - Top Left (ADDED) */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* View Count Overlay - Top Right */}
          <View style={styles.viewCountOverlay}>
            <View style={tw`flex-row items-center gap-1`}>
              <Image
                source={require('../../assets/images/view.png')}
                style={styles.eyeIcon}
              />
              <Text style={styles.viewCountText}>{item.views}</Text>
            </View>
          </View>

          {/* Time Ago Overlay - Bottom Left */}
          <View style={styles.timeAgoOverlay}>
            <Text style={styles.timeAgoText}>
              <TimeAgo createdAt={item?.createdAt} style={styles.timeAgoText} />
            </Text>
          </View>
        </View>

        <Text style={tw`text-xl font-bold text-black mb-2 p-4`}>
          {item.title}
        </Text>
        <Text style={tw`text-[15px] text-gray-700 leading-6 p-4`}>
          {item.description}
        </Text>
      </ScrollView>
    );
  };

  if (isLoading || !allNewsItems) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error || !currentNews) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-red-500`}>Failed to load news details</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white`}>
      <FlatList
        ref={flatListRef}
        data={allNewsItems}
        renderItem={renderNewsItem}
        keyExtractor={item => item._id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={currentIndex}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        onScrollToIndexFailed={info => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
            });
          });
        }}
      />

      {showSwipeGuide && (
        <Animated.View
          style={[
            styles.floatingGuide,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}>
          <View style={styles.guideContainer}>
            <Text style={styles.guideText}>Swipe To See More News</Text>
            <Text style={styles.guideArrow}>→</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  viewCountOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  timeAgoOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  timeAgoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  floatingGuide: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  guideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
  },
  guideText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  guideArrow: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  eyeIcon: {
    width: 14,
    height: 14,
    tintColor: '#ffffff',
  },

  /* ADDED STYLES */
  backButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  backArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default NewsDetails;
