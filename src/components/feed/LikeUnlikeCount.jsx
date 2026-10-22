import React, {useEffect, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import {
  useGetPostLikesQuery,
  useLikePostAPIMutation,
  useUnLikePostAPIMutation,
} from '../../features/feed/feedApiSlice';


const LikeUnlikeCount = ({postId, postLikedByUser, likesCount}) => {
  const {data, isLoading} = useGetPostLikesQuery(postId);

  const [totalLikes, setTotalLikes] = useState(likesCount);

  const [likePostAPI] = useLikePostAPIMutation();
  const [unLikePostAPI] = useUnLikePostAPIMutation();

  const handleLikePost = async id => {
    try {
      const response = await likePostAPI({postId}).unwrap();
    } catch (error) {
 
    }
  };

  const handleUnLikePost = async id => {
    try {
      const response = await unLikePostAPI({postId}).unwrap();
    } catch (error) {
    
    }
  };

  useEffect(() => {
    if (!isLoading && data) {
  
      const likes = typeof data?.likes === 'number' ? data.likes : likesCount;
      setTotalLikes(likes);
    }
  }, [data, isLoading]);

  useEffect(() => {
    setTotalLikes(likesCount);
  }, [likesCount]);

  return (
    <>
      <View style={tw`flex-row gap-2 items-center`}>
        {!postLikedByUser ? (
          <TouchableOpacity onPress={() => handleLikePost(postId)}>
            <Image
              source={require('../../assets/images/thumbsupicon.png')}
              style={tw`w-6 h-6`}
            />
          </TouchableOpacity>
        ) : (
          // else trigger unlike api
          <TouchableOpacity onPress={() => handleUnLikePost(postId)}>
            <Image
              source={require('../../assets/images/likefillicon.png')}
              style={tw`w-6 h-6`}
            />
          </TouchableOpacity>
        )}
        <Text style={tw`text-[#fff]`}>{totalLikes}</Text>
      </View>
    </>
  );
};

export default LikeUnlikeCount;
