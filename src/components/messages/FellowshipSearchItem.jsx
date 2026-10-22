import React from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import {
  useFollowLeaderAPIMutation,
  useFollowUserAPIMutation,
  useRemoveConnectionRequestMutation,
  useSendConnectionRequestMutation,
  useUnFollowLeaderAPIMutation,
  useUnFollowUserAPIMutation,
} from '../../features/messages/messageApiSlice';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';

const FellowshipSearchItem = ({
  item,
  index,
  setUserIdFromSearch,
  setFetchConversationId,
  isLoading,
}) => {
  const navigation = useNavigation();

  

  const [
    removeConnectionRequest,
    {
      isLoading: removeConnectionLoading,
      isError: removeConnectionIsError,
      error: removeConnectionError,
    },
  ] = useRemoveConnectionRequestMutation();

  const [
    sendConnectionRequest,
    {
      isLoading: sendConnectionLoading,
      isError: sendConnectionIsError,
      error: sendConnectionError,
    },
  ] = useSendConnectionRequestMutation();

  const [
    followUserAPI,
    {isLoading: followUserLoading, isError: followUserError},
  ] = useFollowUserAPIMutation();

  const [
    unFollowUserAPI,
    {isLoading: unFollowUserLoading, isError: unFollowUserError},
  ] = useUnFollowUserAPIMutation();

  const [
    followLeaderAPI,
    {isLoading: followLeaderLoading, isError: followLeaderError},
  ] = useFollowLeaderAPIMutation();

  const [
    unFollowLeaderAPI,
    {isLoading: unFollowLeaderLoading, isError: unFollowLeaderError},
  ] = useUnFollowLeaderAPIMutation();

  const handleNavigation = async item => {
    // leader but not following then nav to leader profile
    if (item?.isLeader && !item?.isFollowing) {
      navigation.navigate('LeaderProfile', {leaderId: item?.id});
      return;
    }
    // not a leader but not following then nav to user profile
    // if (!item?.isLeader && !item?.isFollowing) {
    // new condition to navigate to the profile
    
    
    if (!item?.isLeader && item?.relationStatus?.status !== "accepted") {
      
      
      navigation.navigate('IndividualProfile', {userId: item?.id});
      return;
    }
    if (item?.isFollowing) {
      setUserIdFromSearch(item);
      setFetchConversationId(false);
    }
  };

  //   user
  const handleFollowUser = async userId => {
    try {
      const response = await followUserAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };
  const handleUnFollowUser = async userId => {
    try {
      const response = await unFollowUserAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  //   leader
  const handleFollowLeader = async userId => {
    try {
      const response = await followLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  const handleUnFollowLeader = async userId => {
    try {
      const response = await unFollowLeaderAPI({recipientId: userId}).unwrap();
    } catch (error) {}
  };

  // new updates related code
  const handleRemoveRequest = async oppositeUserId => {
    try {
      const res = await removeConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  const handlesendRequest = async oppositeUserId => {
    
    try {
      const res = await sendConnectionRequest({oppositeUserId}).unwrap();
      
    } catch (error) {
      
    }
  };

  return (
    <View style={tw`bg-[#fff] bg-opacity-20`}>
      {(followUserLoading ||
        unFollowUserLoading ||
        removeConnectionLoading ||
        sendConnectionLoading) && (
        <View style={{zIndex: 300}}>
          <LoadingSpinner size={'small'} />
        </View>
      )}
      {/* <Text>{JSON.stringify(item)}</Text> */}
      <View style={tw`flex-row justify-between items-center`}>
        <TouchableOpacity
          key={index}
          style={tw`p-[10px] flex-row  items-center gap-3`}
          onPress={() => handleNavigation(item)}>
          <View style={tw`relative w-9 h-9`}>
            {item?.isLeader && (
              <Image
                source={require('../../assets/images/leadersframe.png')}
                style={tw`absolute top-[-6px] left-[-2px] w-12 h-12 rounded-full`}
              />
            )}
            <Image
              source={
                item?.profileImg
                  ? {uri: item.profileImg}
                  : require('../../assets/images/placeholder.png')
              }
              style={tw`w-9 h-9 left-1 rounded-full`}
            />
            {item?.featured && (
              <Image
                source={require('../../assets/images/profilebadge.png')}
                style={tw`w-[11px] h-[11px] absolute top-[7] left-[9]`}
              />
            )}
          </View>
          <Text style={tw`text-[#0077B6] font-500`}>{item.label}</Text>
        </TouchableOpacity>
        {/* check for user */}
        {isLoading && <LoadingSpinner size={'small'} />}
        <View style={tw`mr-2`}>
          {/* old code that is based on follow and unfollw user */}
          {/* {item.isFollowing && !item?.isLeader && (
            <TouchableOpacity
              onPress={() => handleUnFollowUser(item.id)}
              style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
              <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                Unfollow
              </Text>
            </TouchableOpacity>
          )} */}
          {/* {!item.isFollowing && !item?.isLeader && (
            <TouchableOpacity
              onPress={() => handleFollowUser(item.id)}
              style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
              <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                Connect
              </Text>
            </TouchableOpacity>
          )} */}

          {/* new code to check the relation status of two users */}
          {/* show remove button */}
          {/* {item?.relationStatus?.buttonState === 'remove' &&
            !item?.isLeader && (
              <TouchableOpacity
                onPress={() => handleRemoveRequest(item.id)}
                disabled={removeConnectionLoading}
                style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
                <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                  Remove
                </Text>
              </TouchableOpacity>
            )} */}

          {/* show connect button */}
          {item?.relationStatus?.buttonState === 'connect' &&
            !item?.isLeader && (
              <TouchableOpacity
                onPress={() => handlesendRequest(item.id)}
                disabled={removeConnectionLoading}
                style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
                <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                  Connect
                </Text>
              </TouchableOpacity>
            )}

          {/* check for leader */}
          {item.isFollowing && item?.isLeader && (
            <TouchableOpacity
              onPress={() => handleUnFollowLeader(item.id)}
              style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
              <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                Unfollow
              </Text>
            </TouchableOpacity>
          )}
          {!item.isFollowing && item?.isLeader && (
            <TouchableOpacity
              onPress={() => handleFollowLeader(item.id)}
              style={tw`px-3 py-1 border border-[#0077B6] rounded-2`}>
              <Text style={tw`font-medium text-[#0077B6] text-[12px]`}>
                Follow
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default FellowshipSearchItem;
