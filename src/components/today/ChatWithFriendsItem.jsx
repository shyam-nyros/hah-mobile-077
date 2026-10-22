import React, {useEffect, useState} from 'react';
import LoadingSpinner from '../LoadingSpinner';
import {useNavigation} from '@react-navigation/native';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import tw from 'twrnc';
import {
  useGetConversationIdByUserIdAPIQuery,
  useSendConnectionRequestMutation,
  useListenForRequestConnectionUpdatesQuery,
} from '../../features/messages/messageApiSlice';
import {useDispatch, useSelector} from 'react-redux';
import {setConversationIdNull} from '../../features/home/homeSlice';
import socket from '../../socket/socket';

const ChatWithFriendsItem = ({friendInfo}) => {
  const navigation = useNavigation();

  const {personalItemClicked} = useSelector(state => state.message);
  const {currentUserId} = useSelector(state => state.auth);

  const dispatch = useDispatch();
  const [notificationCount, setNotificationCount] = useState(0);
  const [fetchConversationId, setFetchConversationId] = useState(true);
  const [readyToNavigate, setReadyToNavigate] = useState(false);

  //  useListenForRequestConnectionUpdatesQuery(
  //   {
  //     currentUserId,
  //     oppositeUserId: friendInfo._id,
  //   },
  //   {
  //     skip: !friendInfo?._id,
  //   }
  // );

  const {
    data: listenData,
    isLoading: isListenLoading,
    isFetching: isListenFetching,
    isError: isListenError,
    error: listenError,
  } = useListenForRequestConnectionUpdatesQuery(
    {
      currentUserId,
      oppositeUserId: friendInfo._id,
    },
    {
      skip: !friendInfo?._id,
    },
  );

  useEffect(() => {}, [
    listenData,
    isListenLoading,
    isListenFetching,
    isListenError,
    listenError,
  ]);

  const {data, isLoading, isFetching, isError} =
    useGetConversationIdByUserIdAPIQuery(
      {userId: friendInfo?._id},
      {skip: fetchConversationId},
    );

  const [
    followUserAPI,
    {isLoading: followUserLoading, isError: followUserError},
  ] = useSendConnectionRequestMutation();

  const handleFollowUser = async userId => {
    try {
      const response = await followUserAPI({oppositeUserId: userId}).unwrap();
      
    } catch (error) {
      console.error(error);
    }
  };

  // Determine what to show based on connection status
  const getConnectionAction = () => {
    const status = friendInfo?.connectionStatus;

    if (status === 'none') {
      return {
        showButton: true,
        buttonText: 'Connect',
        action: () => handleFollowUser(friendInfo._id),
      };
    }

    // For all other cases (pending, accepted, etc.), don't show button
    return {showButton: false};
  };

  const handleChatNavigation = (
    userId,
    firstName,
    lastName,
    profileImage,
    // isConnected,
    buttonState,
    // connectionStatus,
  ) => {
    dispatch(setConversationIdNull());
    

    // Check connection status to determine navigation
    if (buttonState === 'remove') {
      // remove implies accepted
      setFetchConversationId(false);
    } else {
      navigation.navigate('IndividualProfile', {userId: userId});
    }
  };

  useEffect(() => {
    if (!isLoading && !isFetching && data) {
      // Ensure that this block is only executed when data is available
      dispatch(setConversationIdNull());
      navigation.navigate('Chat', {
        recepientId: friendInfo._id,
        conversationId: data?.conversation_id ? data?.conversation_id : null,
        name: `${friendInfo.first_name} ${friendInfo.last_name}`,
        profileImage: friendInfo.profile_image,
      });
      // this will skip the query
      setFetchConversationId(true);
      // reset the unread msg count
      setNotificationCount(0);
    }
  }, [isLoading, isFetching, data, navigation, dispatch]);

  // listen for unread messages count
  useEffect(() => {
    if (socket?.socket && friendInfo?.isConnected) {
      // Only listen for connected users
      const eventName = `unread_count_with_sender_${currentUserId}_${friendInfo._id}`;
      socket?.socket?.on(eventName, count => {
        setNotificationCount(count?.unread_count_with_sender);
      });
      return () => {
        socket?.socket?.off(eventName);
      };
    }
  }, [currentUserId, friendInfo]);

  const connectionAction = getConnectionAction();

  return (
    <View horizontal showsHorizontalScrollIndicator={false}>
      {/* Connection Status Button - Only shows for 'none' status */}
      {connectionAction.showButton && (
        <View
          style={tw`bg-[#fff] border absolute top-[5px] right-[18px] z-100 border-[#0077B6] rounded-full flex-1 px-[7px] h-5 flex items-center`}>
          <TouchableOpacity
            onPress={connectionAction.action}
            disabled={followUserLoading}>
            <Text style={tw`text-[#0077B6] flex-1 text-xs`}>
              {connectionAction.buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Unread Message Count - Only show for connected users */}
      {notificationCount > 0 && friendInfo?.isConnected && (
        <View
          style={tw`absolute bottom-[40px] right-[20px] bg-[#FF3C3C] rounded-full w-5 h-5 flex items-center justify-center z-100`}>
          <Text style={tw`text-white text-xs`}>{notificationCount}</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() =>
          handleChatNavigation(
            friendInfo._id,
            friendInfo.first_name,
            friendInfo.last_name,
            friendInfo.profile_image,
            // friendInfo?.isConnected,
            friendInfo?.buttonState,
            // friendInfo?.connectionStatus,
          )
        }>
        <View style={tw`items-center mt-2 w-[65px] mr-4`}>
          <View>
            {(isLoading || isFetching) && <LoadingSpinner size={'small'} />}
            {followUserLoading && <LoadingSpinner size={'small'} />}
            <View style={tw`bg-[#D9D9D9] w-16 h-16 rounded-full`}>
              <Image
                source={
                  friendInfo?.profile_image
                    ? {uri: friendInfo.profile_image}
                    : require('../../assets/images/placeholder.png')
                }
                style={tw`w-16 h-16 mr-1 rounded-full`}
              />
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={tw`text-[12px] text-[#0077B6] font-medium mt-1`}>
            {`${friendInfo.first_name}`}
          </Text>
          <Text
            numberOfLines={1}
            style={tw`text-[12px] text-[#0077B6] font-medium`}>
            {`${friendInfo.last_name}`}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ChatWithFriendsItem;
