import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import tw from 'twrnc';
import LoadingSpinner from '../LoadingSpinner';
import {truncateText} from '../../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import {usePopularAPIQuery} from '../../features/library/libraryApiSlice';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import musicicon from '../../assets/images/musicoutlineicon.png';
import videoicon from '../../assets/images/blueplayicon.png';
import ebookicon from '../../assets/images/bluebookicon.png';
import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';

const Popular = () => {
  const navigation = useNavigation();

  const {
    data: popularList,
    isLoading: popularListLoading,
    isFetching: popularListFetching,
    error: popularListError,
  } = usePopularAPIQuery();

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

  const getCoverImage = libraryType => {
    if (libraryType === 'ebook') {
      return bookcoverImg;
    } else if (libraryType === 'video') {
      return videocoverImg;
    } else {
      return audiocoverImg;
    }
  };

  const renderShimmerPlaceholder = () => (
    <View style={tw`mb-4`}>
      {[...Array(4)].map((_, index) => (
        <View key={index} style={tw`flex-row items-center mb-3`}>
          <ShimmerPlaceholder
            style={tw`h-14 w-22 rounded`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <View style={tw`ml-2`}>
            <ShimmerPlaceholder
              style={tw`h-4 w-30 mb-1 rounded`}
              shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={tw`h-3 w-20 rounded`}
              shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <>
      {popularListLoading ? (
        renderShimmerPlaceholder()
      ) : popularListError ? (
        <View style={tw`flex-1 mb-2 mt-2 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>Failed to load popular items</Text>
        </View>
      ) : popularList.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-gray-500`}>No popular items available</Text>
        </View>
      ) : (
        <ScrollView horizontal={true} style={tw`w-full`}>
          <View style={tw`flex-row`}>
            {/* Column 1: Showing the first four items */}
            {popularList && popularList.length > 0 && (
              <View style={tw`w-1/2 gap-1 p-2`}>
                {popularList.slice(0, 4).map((item, index) => (
                  <TouchableOpacity
                    onPress={() => handleNavigation(item?.type, item._id)}
                    key={item._id}
                    style={tw`flex flex-row gap-1 mb-3 items-center`}>
                    <Text
                      style={tw`text-[20px] text-[#040641] w-6 font-semibold`}>
                      {index + 1}
                    </Text>
                    <View style={tw`flex-row gap-2 items-start`}>
                      <View style={styles.container}>
                        <Image
                          source={
                            item.cover_image
                              ? {uri: item.cover_image}
                              : getCoverImage(item?.type)
                          }
                          style={tw`w-22 h-14 rounded`}
                        />
                        {item?.type && (
                          <Image
                            source={getLibraryItemIconType(item?.type)}
                            style={tw`absolute top-1 left-1 w-4 h-4 bg-white bg-opacity-90 rounded-full`}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <View>
                        <TouchableOpacity
                          onPress={() =>
                            handleNavigation(item?.type, item._id)
                          }>
                          <Text
                            numberOfLines={2}
                            style={tw`text-[13px] text-[#0077B6] font-600 w-30`}>
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                        <Text
                          numberOfLines={1}
                          style={tw`text-[12px] text-[#040641] font-400 opacity-60 w-30`}>
                          {item?.author?.first_name || 'N/A'}
                          {item?.author?.last_name
                            ? ` ${item.author.last_name}`
                            : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Column 2: Showing the next four items */}
            {popularList && popularList.length > 4 && (
              <View style={tw`w-1/2 gap-1 p-2`}>
                {popularList.slice(4, 8).map((item, index) => (
                  <TouchableOpacity
                    onPress={() => handleNavigation(item?.type, item._id)}
                    key={item._id}
                    style={tw`flex flex-row gap-1 mb-3 items-center`}>
                    <Text
                      style={tw`text-[20px] text-[#040641] w-6 font-semibold`}>
                      {index + 5}
                    </Text>
                    <View style={tw`flex-row gap-2 items-start`}>
                      <View style={styles.container}>
                        <Image
                          source={
                            item.cover_image
                              ? {uri: item.cover_image}
                              : getCoverImage(item?.type)
                          }
                          style={tw`w-22 h-14 rounded`}
                        />
                        {item?.type && (
                          <Image
                            source={getLibraryItemIconType(item?.type)}
                            style={tw`absolute top-1 left-1 w-4 h-4 bg-white bg-opacity-90 rounded-full`}
                            resizeMode="contain"
                          />
                        )}
                      </View>
                      <View>
                        <TouchableOpacity
                          onPress={() =>
                            handleNavigation(item?.type, item._id)
                          }>
                          <Text
                            numberOfLines={2}
                            style={tw`text-[13px] text-[#0077B6] font-600 w-30`}>
                            {item.title}
                          </Text>
                        </TouchableOpacity>
                        <Text
                          numberOfLines={1}
                          style={tw`text-[12px] text-[#040641] font-400 opacity-60 w-30`}>
                          {item?.author?.first_name || 'N/A'}
                          {item?.author?.last_name
                            ? ` ${item.author.last_name}`
                            : ''}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000', // Color of the shadow for iOS
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 2, // Radius of the shadow for iOS
    elevation: 2, // Elevation for Android
  },
});

export default Popular;
