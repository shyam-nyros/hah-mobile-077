import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

const Post = ({postItem}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('PostDetails', {postId: postItem.contentId});
  };

  // Extract the number from the title
  const match = postItem?.title?.match(/\b(\d+)\s+other(s)?\b/i);
  const number = match ? parseInt(match[1], 10) : 0;

  return (
    <TouchableOpacity onPress={handlePress} style={tw``}>
      {/* <View
        key={postItem.contentId}
        style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2`}>
          <View style={tw`relative`}>
            <View style={tw`w-12 h-14 rounded-full relative`}>
              <Image
                source={
                  postItem?.user?.profile_image
                    ? {uri: postItem?.user?.profile_image}
                    : require('../../assets/images/whiteplaceholder.png')
                }
                style={tw`w-11 h-11 rounded-full`}
              />
            </View>
          </View>

          
          {number >= 1 && (
            <View style={tw`relative`}>
              <View style={tw`w-12 h-14 rounded-full relative`}>
                <Image
                  source={require('../../assets/images/whiteplaceholder.png')}
                  style={tw`w-11 h-11 rounded-full`}
                />
              </View>
            </View>
          )}

          <View>
            <Text
              numberOfLines={2}
              style={tw`text-[#040641] w-[90%] text-[14px] font-semibold`}>
              {postItem?.title}
            </Text>
          </View>
        </View>
      </View> */}

      <View
        key={postItem.contentId}
        style={tw`flex-row justify-between items-center`}>
        <View style={tw`flex-row items-start gap-2 `}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`relative `}>
              {/* for 1 image */}
              {number < 1 && (
                <Image
                  source={
                    postItem?.user?.profile_image
                      ? {uri: postItem?.user?.profile_image}
                      : require('../../assets/images/whiteplaceholder.png')
                  }
                  style={tw`w-10 h-10 bg-black rounded-full mb-1`}
                />
              )}
              {/* for 2 images  */}
              {number >= 1 && (
                <>
                  <Image
                    source={
                      postItem?.user?.profile_image
                        ? {uri: postItem?.user?.profile_image}
                        : require('../../assets/images/whiteplaceholder.png')
                    }
                    style={tw`w-7 h-7 absolute -top-3 left-4 rounded-full`}
                  />
                  <Image
                    source={require('../../assets/images/whiteplaceholder.png')}
                    style={tw`w-7 h-7 absolute -top-6 left-0 bg-black rounded-full`}
                  />
                </>
              )}
            </View>
            <View style={[tw`ml-3mb-1`, number >= 1 && tw`ml-15 mb-1 mt-2`]}>
              <View style={tw`flex-row`}>
                <Text
                  numberOfLines={2}
                  style={tw`text-[#040641] w-[92%] text-[14px] font-semibold`}>
                  {postItem?.title}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={tw`border-b border-[#ccc] opacity-20 mt-1 mb-2`} />
    </TouchableOpacity>
  );
};

export default Post;
