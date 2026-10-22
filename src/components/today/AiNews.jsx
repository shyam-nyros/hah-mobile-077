import React from 'react';
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import tw from 'twrnc';
import {useNewsAPIQuery , useNewsItemViewedAPIMutation} from '../../features/home/homeApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

const {width: screenWidth} = Dimensions.get('window');

const NewsList = () => {
  const navigation = useNavigation();
  const {
    data: newsItems,
    isLoading,
    isFetching,
    error,
  } = useNewsAPIQuery();

  const [markNewsAsViewed] = useNewsItemViewedAPIMutation();

  const handleNewsDetails = async (newsId) => {
    try {
      await markNewsAsViewed(newsId); 
    } catch (error) {
      console.error('Failed to mark news as viewed:', error);
    }

    navigation.navigate('NewsDetails', { newsId });
  };

  const renderShimmerPlaceholder = () => (
    <View style={styles.stickyFrame}>
      <ShimmerPlaceholder
        style={[tw`h-[100px] w-full rounded-[12px]`]}
        shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
        LinearGradient={LinearGradient}
      />
    </View>
  );

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleNewsDetails(item._id)}
      style={[tw`flex-row bg-white rounded-[16px] p-3`, styles.cardItem]}>
      <Image
        source={
          item?.aigenerated
            ? item?.ai_cover_image
              ? {uri: item.ai_cover_image}
              : require('../../assets/images/defaults/eventslarge.png')
            : item?.cover_image?.path
            ? {uri: item.cover_image.path}
            : require('../../assets/images/defaults/eventslarge.png')
        }
        style={styles.image}
        resizeMode="cover"
      />
      <View style={tw`flex-1 ml-2`}>
        <Text
          style={tw`text-[13px] text-[#0F172A] font-semibold`}
          numberOfLines={3}>
          {item.title}
        </Text>
        {/* Swipe Message */}
        <View style={tw`items-end mt-2 ml-2`}>
          <View
            style={tw`flex-row items-center justify-center bg-[#6c757d] px-2 mt-1 rounded-full`}>
            <Text style={tw`text-[10px] text-[#ffffff] mr-1`}>
              Swipe To See More News
            </Text>
            <Text style={tw`text-[13px] mb-1 font-semibold text-[#ffffff]`}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Section Header */}
      <View style={tw`flex-row items-center mt-2 mb-2`}>
        <Image
          source={require('../../assets/images/calendaricon.png')}
          style={tw`w-[17px] h-[17px] mr-1`}
        />
        <Text style={tw`text-[16px] text-[#040641] font-semibold`}>
          World News
        </Text>
      </View>

      {/* Content */}
      {isLoading || isFetching ? (
        renderShimmerPlaceholder()
      ) : error ? (
        <View style={tw`justify-center items-center mt-2`}>
          <Text style={tw`text-gray-500`}>Failed to load News</Text>
        </View>
      ) : newsItems && newsItems.length === 0 ? (
        <View style={tw`justify-center items-center mt-2`}>
          <Text style={tw`text-gray-500 text-center w-70`}>
            There are no news! Click "See All" to explore more news.
          </Text>
        </View>
      ) : (
        <View>
          {/* Sticky Frame Container */}
          <View style={styles.stickyFrame}>
            <FlatList
              data={newsItems}
              renderItem={renderItem}
              keyExtractor={item => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToAlignment="center"
              decelerationRate="fast"
              ItemSeparatorComponent={() => <View style={{width: 12}} />}
              contentContainerStyle={{paddingHorizontal: 12}}
              getItemLayout={(data, index) => ({
                length: wp('85%') + 12,
                offset: (wp('85%') + 12) * index,
                index,
              })}
            />
          </View>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  stickyFrame: {
    width: wp('90%'), // Fixed frame width
    height: 130, // Fixed frame height
    alignSelf: 'center',
    overflow: 'hidden', // This is crucial - hides content outside the frame
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  cardItem: {
    width: wp('85%'), // Card width (slightly smaller than frame)
    height: 110, // Fixed card height
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
});

export default NewsList;