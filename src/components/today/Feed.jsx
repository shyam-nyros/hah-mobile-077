import {useState, useCallback} from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';
import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useFeedHomeQuery} from '../../features/home/homeApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import CustomVideoPlayer from '../../utils/videoplayer/CustomVideoPlayer';

const Feed = () => {
  const navigation = useNavigation();

  const {
    data: feedList,
    isLoading: feedListLoading,
    isError: feedListError,
    refetch: refetchFeedList,
  } = useFeedHomeQuery();

  const handleFeedNavigation = postId => {
    navigation.navigate('PostDetails', {postId});
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 justify-between flex-row`}>
      {[...Array(1)].map((_, index) => (
        <ShimmerPlaceholder
          key={index}
          style={tw` h-[250px] w-full rounded-[10px]`}
          shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
          LinearGradient={LinearGradient}
        />
      ))}
    </View>
  );

  const TextPost = ({item}) => {
    return (
      <View style={tw`flex justify-center items-center min-h-scree`}>
        <TouchableOpacity
          key={item._id}
          onPress={() => handleFeedNavigation(item._id)}>
          <View style={tw`bg-[#0077B6] p-3 flex  rounded-[16px] mr-4 `}>
            <View>
              {item?.type === 'text' && (
                <View
                  style={tw` bg-[#CAF0F8] h-[164px] flex justify-center items-center p-3 w-76 rounded-[10px]`}>
                  <Text
                    style={tw`text-[16px] font-450 text-[#040641] mt-1 text-center`}>
                    {item.description}
                  </Text>
                </View>
              )}
            </View>

            <View style={tw` mt-4 `}>
              <Text
                style={tw`text-[18px] text-[#fff] font-medium w-76`}
                numberOfLines={1}>
                {item.title}
              </Text>
            </View>
            <View style={tw`border-b border-[#ccc] opacity-19 mt-2 mb-2`} />

            <View style={tw`flex-row items-center justify-between`}>
              <View style={tw`flex-row items-center gap-8`}>
                <View style={tw`flex-row items-center`}>
                  <Image
                    source={require('../../assets/images/thumbsupicon.png')}
                    style={tw`w-5 h-5`}
                  />
                  <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                    {item.likes_count}
                  </Text>
                </View>

                <View style={tw`flex-row items-center `}>
                  <Image
                    source={require('../../assets/images/commenticon.png')}
                    style={tw`w-5 h-5`}
                  />
                  <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                    {item.comments_count}
                  </Text>
                </View>
              </View>

              <View style={tw`flex-row items-center`}>
                <Image
                  source={require('../../assets/images/shareicon.png')}
                  style={tw`w-5 h-5`}
                />
                <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                  {item.shares}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const OtherPost = ({item}) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => handleFeedNavigation(item._id)}>
        <View style={tw`bg-[#0077B6] p-3 rounded-[16px] mr-4`}>
          <View style={tw` h-[164px] rounded-[10px]`}>
            {item?.type === 'image' && (
              <Image
                source={{uri: item.attachment}}
                style={tw`w-full h-41 rounded-[10px]`}
              />
            )}
            {item?.type === 'pdf' && (
              <View style={tw`flex-1  justify-center items-center`}>
                <Image
                  source={require('../../assets/images/graypdficon.png')}
                  style={tw` w-28 h-28`}
                />
              </View>
            )}
            {item?.type === 'video' && (
              <View style={tw`h-[164px] rounded-[10px] overflow-hidden`}>
                <CustomVideoPlayer
                  uri={item.attachment}
                  controlsStyles={{
                    hideSeekBar: false,
                    hideDuration: false,
                    seekIncrementMS: 10000,
                    hideNavigationBarOnFullScreenMode: true,
                    hideNotificationBarOnFullScreenMode: true,
                  }}
                />
              </View>
            )}
          </View>
          <View style={tw`mt-4 `}>
            <Text
              style={tw`text-[18px] text-[#fff] font-medium w-76`}
              numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          <View style={tw`border-b border-[#ccc] opacity-19 mt-2 mb-2`} />
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-8`}>
              <View style={tw`flex-row items-center`}>
                <Image
                  source={require('../../assets/images/thumbsupicon.png')}
                  style={tw`w-5 h-5`}
                />
                <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                  {item.likes_count}
                </Text>
              </View>

              <View style={tw`flex-row items-center `}>
                <Image
                  source={require('../../assets/images/commenticon.png')}
                  style={tw`w-5 h-5`}
                />
                <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                  {item.comments_count}
                </Text>
              </View>
            </View>
            <View style={tw`flex-row items-center`}>
              <Image
                source={require('../../assets/images/shareicon.png')}
                style={tw`w-5 h-5`}
              />
              <Text style={tw`text-[13px] font-medium text-[#fff] ml-1`}>
                {item.shares}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItem = ({item}) => (
    <>
      {item?.type === 'text' && <TextPost item={item} />}
      {item?.type !== 'text' && <OtherPost item={item} />}
    </>
  );

  return (
    <>
      {feedListLoading ? (
        renderShimmerPlaceholder()
      ) : feedListError ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to Feed</Text>
        </View>
      ) : feedList?.length === 0 ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No Feed data</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={feedList}
            renderItem={renderItem}
            keyExtractor={item => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
          />
        </>
      )}
    </>
  );
};

export default Feed;
