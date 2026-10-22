import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import {ShieldCheckIcon} from 'react-native-heroicons/solid';
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import {useNavigation} from '@react-navigation/native';
import {useLeaderCollectionsAPIQuery} from '../../features/home/homeApiSlice';

import musicicon from '../../assets/images/musicoutlineicon.png';
import videoicon from '../../assets/images/blueplayicon.png';
import ebookicon from '../../assets/images/bluebookicon.png';
import bookcoverImg from '../../assets/images/defaults/bookplaceholder.png';
import videocoverImg from '../../assets/images/defaults/videothumbnail.png';
import audiocoverImg from '../../assets/images/podcastplaceholder.png';

const TYPE_ICONS = {
  video: videoicon,
  ebook: ebookicon,
  audio: musicicon,
};

const TYPE_LABELS = {
  video: 'Video',
  ebook: 'Ebook',
  audio: 'Podcast',
};

const TYPE_BADGE_COLOR = 'rgba(0, 119, 182, 0.6)';

const getPlaceholderImage = type => {
  if (type === 'ebook') return bookcoverImg;
  if (type === 'video') return videocoverImg;
  return audiocoverImg;
};

// safer URL encoding
const encodeImageUri = uri => {
  if (!uri) return null;
  return encodeURI(uri);
};

const LeaderCard = ({leader, cardWidth, cardHeight}) => {
  const navigation = useNavigation();
  const libraries = leader.libraries || [];

  const handleLeaderPress = () => {
    navigation.navigate('LeaderProfile', {leaderId: leader._id});
  };

  const handleLibraryPress = lib => {
    if (lib.type === 'ebook') {
      navigation.navigate('BookDetails', {libraryItemId: lib._id});
    } else if (lib.type === 'video') {
      navigation.navigate('VideoDetails', {libraryItemId: lib._id});
    } else {
      navigation.navigate('PodcastDetails', {libraryItemId: lib._id});
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleLeaderPress}
      style={[
        tw`mr-3 rounded-[16px] overflow-hidden border border-gray-200`,
        {width: cardWidth, height: cardHeight},
      ]}>
      {/* 🔥 Background Image */}
      <Image
        source={{uri: encodeImageUri(leader.profile_image)}}
        style={tw`w-full h-full absolute`}
        resizeMode="cover"
      />

      {/* 🔥 Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={[
          tw`absolute bottom-0 left-0 right-0`,
          {height: Math.floor(cardHeight * 0.75)},
        ]}
      />

      {/* 🔥 Bottom Content */}
      <View style={tw`absolute bottom-0 left-0 right-0 p-3`}>
        {/* ✅ Verified Badge (moved here) */}
        {/* {leader.is_verified && (
          <View
            style={tw`bg-white/50 px-2 py-[3px] rounded-full flex-row items-center self-start mb-1`}>
            <ShieldCheckIcon size={12} color="#FFFFFF" style={tw`mr-1`} />
            <Text style={tw`text-[10px] text-[#040641] font-medium`}>
              Verified Leader
            </Text>
          </View>
        )} */}
        {leader.is_verified && (
          <View
            style={[
              tw`px-2 py-[3px] rounded-full flex-row items-center self-start mb-1`,
              {
                backgroundColor: 'rgba(255,255,255,0.55)', // glass feel
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.4)',
                shadowColor: '#000',
                shadowOpacity: 0.08,
                shadowRadius: 3,
                elevation: 2, // Android shadow
              },
            ]}>
            <ShieldCheckIcon size={12} color="#FFFFFF" style={tw`mr-1`} />
            <Text style={tw`text-[10px] text-[#FFFFFF] font-medium`}>
              Verified Leader
            </Text>
          </View>
        )}
        {/* Leader Name */}
        <Text numberOfLines={2} style={tw`text-white text-[15px] mb-2`}>
          {leader.first_name} {leader.last_name}
        </Text>

        {/* Libraries */}
        <View style={tw`flex-row`}>
          {libraries.slice(0, 2).map(lib => (
            <TouchableOpacity
              key={lib._id}
              activeOpacity={0.8}
              onPress={() => handleLibraryPress(lib)}
              style={tw`w-[60px] h-[60px] rounded-[10px] overflow-hidden mr-2 bg-white`}>
              <Image
                source={
                  lib.cover_image
                    ? {uri: encodeImageUri(lib.cover_image)}
                    : getPlaceholderImage(lib.type)
                }
                style={tw`w-full h-full`}
                resizeMode="cover"
              />

              {/* Type Badge */}
              <View
                style={[
                  tw`absolute top-1 left-1 px-1 py-[2px] rounded flex-row items-center`,
                  {backgroundColor: TYPE_BADGE_COLOR},
                ]}>
                <Image
                  source={TYPE_ICONS[lib.type]}
                  style={tw`w-[8px] h-[8px] mr-[2px] tint-white`}
                  resizeMode="contain"
                />
                <Text style={tw`text-white text-[8px]`}>
                  {TYPE_LABELS[lib.type]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const LeaderCollections = () => {
  const navigation = useNavigation();
  const {data: leaders, isLoading, isError} = useLeaderCollectionsAPIQuery();
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();

  // parent container has px-4 (16px each side = 32px) and cards have mr-3 (12px) gap
  const cardWidth = Math.floor((screenWidth - 32 - 12) / 2);
  // ~30% of screen height keeps cards proportional across all device sizes
  const cardHeight = Math.floor(screenHeight * 0.3);

  const renderShimmer = () => (
    <View style={tw`flex-row`}>
      {[...Array(2)].map((_, i) => (
        <View
          key={i}
          style={[
            tw`mr-3 rounded-[20px] bg-[#E2E8F0]`,
            {width: cardWidth, height: cardHeight},
          ]}
        />
      ))}
    </View>
  );

  if (isError) return null;

  return (
    <View style={tw`mb-6`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-[6px]`}>
        <View style={tw`flex-row items-center`}>
          <Image
            source={require('../../assets/images/shield.png')}
            style={tw`w-[17px] h-[17px] mr-1`}
          />
          <Text style={tw`text-[16px] text-[#040641] font-semibold`}>
            Leader Collections
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('GlobalLeaderScreen')}>
          <Text style={tw`text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={tw`text-[13px] text-[#040641] opacity-70 mb-4`}>
        Teachings & content from global leaders
      </Text>

      {isLoading ? (
        renderShimmer()
      ) : !leaders || leaders.length === 0 ? null : (
        <FlatList
          data={leaders}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <LeaderCard
              leader={item}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default LeaderCollections;
