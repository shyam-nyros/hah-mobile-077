import React, {useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';

import tw from 'twrnc';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useFavoritesAPIQuery} from '../../../features/auth/authApiSlice';
import LoadingSpinner from '../../../components/LoadingSpinner';

import musicicon from '../../../assets/images/musicoutlineicon.png';
import videoicon from '../../../assets/images/blueplayicon.png';
import ebookicon from '../../../assets/images/bluebookicon.png';

import bookcoverImg from '../../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../../assets/images/podcastplaceholder.png';
import {useSelector} from 'react-redux';

const FavoritesScreen = () => {
  const navigation = useNavigation();

  const {reloadFlagForBlockUser} = useSelector(state => state.feed);

  const {
    data: favoriteslist,
    isLoading: favoriteslistLoading,
    error: favoriteslistError,
    refetch: refetchFavoritesList,
  } = useFavoritesAPIQuery({}, {refetchOnMountOrArgChange: true});

  useFocusEffect(
    useCallback(() => {
      refetchFavoritesList();
    }, [refetchFavoritesList, reloadFlagForBlockUser]),
  );

  const renderShimmerPlaceholder = () => (
    <View style={tw`flex-row justify-between mt-3 mb-3`}>
      {[...Array(2)].map((_, index) => (
        <View key={index} style={tw`w-[48%]`}>
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-full h-40 rounded-lg mb-2`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-4 rounded-md mb-1`}
          />
          <ShimmerPlaceholder
            LinearGradient={LinearGradient}
            style={tw`w-3/4 h-4 rounded-md`}
          />
        </View>
      ))}
    </View>
  );

  if (favoriteslistLoading) {
    return (
      <View style={tw`flex-1 px-4`}>
        {Array(4)
          .fill(null)
          .map((_, index) => (
            <View key={index}>{renderShimmerPlaceholder()}</View>
          ))}
      </View>
    );
  }

  if (favoriteslistError) {
    return <Text style={tw`text-center mt-10`}>Failed to load favorites.</Text>;
  }

  const navigateToPreviousScreen = () => {
    navigation.goBack();
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

  const handleNavigation = (libraryType, id) => {
    if (libraryType.includes('audio')) {
      navigation.navigate('PodcastDetails', {libraryItemId: id});
    } else if (libraryType.includes('video')) {
      navigation.navigate('VideoDetails', {libraryItemId: id});
    } else if (libraryType === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: id});
    }
  };

  const renderItem = ({item}) => {
    const coverImageSource = item.library.cover_image?.path
      ? {uri: item.library.cover_image.path}
      : getCoverImage(item.library?.type);

    return (
      <TouchableOpacity
        key={item._id}
        style={styles.cardContainer}
        onPress={() => handleNavigation(item.library.type, item.library._id)}>
        <View style={tw`relative`}>
          {/* Icon Overlay */}
          <Image
            source={getLibraryItemIconType(item.library?.type)}
            style={tw`w-4 h-4 bg-white rounded-full absolute top-1 left-1 z-10`}
            resizeMode="contain"
          />

          {/* Cover Image */}
          <Image source={coverImageSource} style={styles.img} />

          {/* Price Tag */}
          {item.library.price?.$numberDecimal && (
            <View
              style={tw`p-1 px-4 rounded-full bg-[#0077B6] absolute right-2 bottom-2`}>
              <Text style={tw`text-[12px] text-white font-medium`}>
                {`$ ${item.library.price.$numberDecimal}`}
              </Text>
            </View>
          )}
        </View>

        {/* Title and Author */}
        <View style={tw`mt-2`}>
          <Text
            style={[tw`text-[#0077B6] font-medium`, styles.text]}
            numberOfLines={1}>
            {item?.library.title}
          </Text>
          <Text
            style={[
              tw`text-[#040641] font-medium opacity-80`,
              styles.textAuthor,
            ]}
            numberOfLines={1}>
            {item?.library?.author?.first_name || 'N/A'}
            {item?.library?.author?.last_name
              ? ` ${item.library?.author?.last_name}`
              : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View style={tw`bg-white`}>
        {/* Header */}
        <SafeAreaView style={tw`bg-[#0077B6]`}>
          <TouchableOpacity onPress={navigateToPreviousScreen}>
            <View style={tw`mx-2 flex-row py-4 items-center`}>
              <View>
                <Image
                  source={require('../../../assets/images/chevronlefticon.png')}
                  style={tw`w-[26px] h-[26px]`}
                />
              </View>
              <Text style={tw`text-xl text-white font-medium ml-2`}>
                Favorites
              </Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Library Cards */}
      {favoriteslist?.bookmarks?.length > 0 ? (
        <FlatList
          data={favoriteslist.bookmarks}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={tw`p-4`}
          columnWrapperStyle={tw`justify-between`}
        />
      ) : (
        <Text style={tw`text-center mt-10 text-gray-500`}>
          No favorites found.
        </Text>
      )}
    </>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  img: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textAuthor: {
    marginTop: -2,
    fontSize: 12,
  },
  cardContainer: {
    width: '47%',
    marginBottom: 16,
  },
});
