import React from 'react';
import {View, Text, Image, TouchableOpacity, FlatList} from 'react-native';
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
  audio: 'Audio',
};

const TYPE_COLORS = {
  video: '#0077B6',
  ebook: '#059669',
  audio: '#7C3AED',
};

const getPlaceholderImage = type => {
  if (type === 'ebook') return bookcoverImg;
  if (type === 'video') return videocoverImg;
  return audiocoverImg;
};

// Encode spaces and special chars in server-returned image URLs
const encodeImageUri = uri => (uri ? uri.replace(/ /g, '%20') : null);

const LeaderCard = ({leader}) => {
  const navigation = useNavigation();
  const libraries = leader.libraries || [];

  const handleLeaderPress = () => {
    navigation.navigate('LeaderProfile', {leaderId: leader._id});
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleLeaderPress}
      style={tw`w-[165px] h-[220px] mr-3 rounded-[20px] overflow-hidden`}>
      {/* 🔥 Leader Full Background */}
      <Image
        source={{uri: encodeImageUri(leader.profile_image)}}
        style={tw`w-full h-full absolute`}
        resizeMode="cover"
      />

      {/* 🔥 Dark overlay for readability */}
      <View style={tw`absolute inset-0 bg-black/30`} />

      {/* 🔥 Top Content */}
      <View style={tw`flex-1 justify-between p-3`}>
        {/* Verified Badge */}
        {leader.is_verified && (
          <View
            style={tw`self-start bg-white/80 px-2 py-[3px] rounded-full flex-row items-center`}>
            <Image
              source={require('../../assets/images/profilebadge.png')}
              style={tw`w-[10px] h-[10px] mr-1`}
            />
            <Text style={tw`text-[10px] text-[#040641] font-medium`}>
              Verified Leader
            </Text>
          </View>
        )}

        {/* Leader Name */}
        <Text
          numberOfLines={2}
          style={tw`text-white text-[14px] font-semibold`}>
          {leader.first_name} {leader.last_name}
        </Text>

        {/* 🔥 Bottom Library Cards */}
        <View style={tw`flex-row`}>
          {libraries.slice(0, 2).map((lib, index) => (
            <TouchableOpacity
              key={lib._id}
              style={tw`w-[60px] h-[60px] rounded-[10px] overflow-hidden mr-2 bg-white`}
              activeOpacity={0.8}>
              <Image
                source={
                  lib.cover_image
                    ? {uri: encodeImageUri(lib.cover_image)}
                    : getPlaceholderImage(lib.type)
                }
                style={tw`w-full h-full`}
                resizeMode="cover"
              />

              {/* Type badge */}
              <View
                style={[
                  tw`absolute top-1 left-1 px-1 py-[2px] rounded`,
                  {backgroundColor: TYPE_COLORS[lib.type] || '#0077B6'},
                ]}>
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

  const renderShimmer = () => (
    <View style={tw`flex-row`}>
      {[...Array(3)].map((_, i) => (
        <View key={i} style={tw`w-[155px] mr-3`}>
          <ShimmerPlaceholder
            style={tw`w-full h-[110px] rounded-t-[16px]`}
            shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
            LinearGradient={LinearGradient}
          />
          <View style={tw`bg-white rounded-b-[16px] p-3`}>
            <View style={tw`flex-row items-center mb-2`}>
              <ShimmerPlaceholder
                style={tw`w-8 h-8 rounded-full mr-2`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
              <ShimmerPlaceholder
                style={tw`h-3 w-20 rounded`}
                shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
                LinearGradient={LinearGradient}
              />
            </View>
            <ShimmerPlaceholder
              style={tw`h-3 w-full rounded mb-1`}
              shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
              LinearGradient={LinearGradient}
            />
            <ShimmerPlaceholder
              style={tw`h-3 w-3/4 rounded`}
              shimmerColors={['#e0e0e0', '#f2f2f2', '#e0e0e0']}
              LinearGradient={LinearGradient}
            />
          </View>
        </View>
      ))}
    </View>
  );

  if (isError) return null;

  return (
    <View style={tw`mb-6`}>
      {/* Section Header */}
      <View style={tw`flex-row justify-between items-center mb-[6px]`}>
        <Text
          style={tw`text-[15px] md:text-[16px] lg:text-[16px] text-[#040641] font-semibold`}>
          Leader Collections
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('GlobalLeaderScreen')}>
          <Text
            style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-50`}>
            See all {'>'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text
        style={tw`text-[13px] md:text-[14px] lg:text-[14px] text-[#040641] opacity-70 mb-4`}>
        Teachings & content from global leaders
      </Text>

      {isLoading ? (
        renderShimmer()
      ) : !leaders || leaders.length === 0 ? null : (
        <FlatList
          data={leaders}
          keyExtractor={item => item._id}
          renderItem={({item}) => <LeaderCard leader={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default LeaderCollections;
