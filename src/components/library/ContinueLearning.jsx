import React, {useRef, useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import {useLearningAPIQuery} from '../../features/library/libraryApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

import {truncateText} from '../../utils/helpers';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import musicicon from '../../assets/images/musicoutlineicon.png';
import videoicon from '../../assets/images/blueplayicon.png';
import ebookicon from '../../assets/images/bluebookicon.png';

import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';
import {useSelector} from 'react-redux';

const ContinueLearning = () => {
  const {reloadFlagForBlockUser} = useSelector(state => state.feed);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemWidth = wp('35.4%');

  const {
    data: continueLearningList,
    isLoading: continueLearningListLoading,
    isFetching: continueLearningListFetching,
    error: continueLearningListError,
    refetch,
  } = useLearningAPIQuery();
  const navigation = useNavigation();

  const getCoverImage = libraryType => {
    if (libraryType === 'audio') {
      return audiocoverImg;
    } else if (libraryType === 'video') {
      return videocoverImg;
    } else {
      return bookcoverImg;
    }
  };

  const handleNavigation = (libraryType, id) => {
    if (libraryType === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: id});
    } else if (libraryType === 'video') {
      navigation.navigate('VideoDetails', {libraryItemId: id});
    } else {
      navigation.navigate('PodcastDetails', {libraryItemId: id});
    }
  };

  const getLibraryItemIconType = libraryType => {
    if (libraryType === 'ebook') {
      return ebookicon;
    } else if (libraryType === 'video') {
      return videoicon;
    } else {
      return musicicon;
    }
  };

  // when a user is blocked then reload
  useEffect(() => {
    refetch();
  }, [reloadFlagForBlockUser]);

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4 gap-3 justify-between flex-row`}>
      {[...Array(3)].map((_, index) => (
        <View key={index} style={tw`h-[120px] w-[140px]`}>
          <ShimmerPlaceholder
            style={tw`h-[83px] w-[140px] rounded-[10px] mb-2`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[16px] w-[100px] rounded-[4px] mb-1`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <ShimmerPlaceholder
            style={tw`h-[12px] w-[70px] rounded-[4px]`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
        </View>
      ))}
    </View>
  );

  if (continueLearningListLoading || continueLearningListFetching) {
    return renderShimmerPlaceholder();
  }

  if (!continueLearningList || continueLearningList.length === 0) {
    return (
      <View style={tw`flex justify-center items-center mt-3 mb-3`}>
        <Text style={tw`text-[14px] text-[#040641]`}>No Learning!</Text>
      </View>
    );
  }

  const renderItem = ({item, index}) => (
    <View key={item._id} style={{width: itemWidth, marginRight: 16}}>
      <TouchableOpacity
        onPress={() => handleNavigation(item.library?.type, item.library._id)}>
        <View style={tw`h-[83px] rounded-[10px] mb-1`}>
          <Image
            source={getLibraryItemIconType(item.library?.type)}
            style={tw`w-4 h-4 bg-white bg-opacity-90 rounded-full absolute top-1 left-1 z-10`}
            resizeMode="contain"
          />
          {/* not AI generated */}
          {!item.library?.aigenerated && (
            <Image
              source={
                item.library?.cover_image?.path
                  ? {uri: item.library?.cover_image?.path}
                  : getCoverImage(item?.library?.type)
              }
              style={tw`w-full h-20 rounded-lg`}
              resizeMode="cover"
            />
          )}
          {/*AI generated */}
          {item.library?.aigenerated && (
            <Image
              source={
                item.library?.ai_cover_image
                  ? {uri: item.library?.ai_cover_image}
                  : getCoverImage(item?.library?.type)
              }
              style={tw`w-full h-20 rounded-lg`}
              resizeMode="cover"
            />
          )}
        </View>
        <View style={tw`rounded-bl-[10px] rounded-br-[10px]`}>
          <Text style={tw`text-[14px] text-[#0077B6] font-medium mb-1`}>
            {truncateText(item.library?.title, 15)}
          </Text>
          <Text
            numberOfLines={1}
            style={tw`text-[12px] text-[#040641] font-400 opacity-60 w-30`}>
            {item?.library?.author?.first_name || 'N/A'}
            {item?.library?.author?.last_name
              ? ` ${item.library?.author?.last_name}`
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <FlatList
        data={continueLearningList}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentIndex}
        viewabilityConfig={{viewAreaCoveragePercentThreshold: 50}}
      />
    </View>
  );
};

export default ContinueLearning;
