import React, {useEffect, useState} from 'react';
import {Text} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  setGroupConversationList,
  setPersonalConversationList,
} from '../../features/messages/messageSlice';
import {
  useListenForOnlineUsersQuery,
  useMessageInboxQuery,
} from '../../features/chat/chatApiSlice';

import {setCurrentOnlineUsers} from '../../features/auth/authSlice';
import socket from '../../socket/socket';
// import {useListenForRemoveConnectionQuery} from '../../features/messages/messageApiSlice';

const MessageInbox = () => {
  const dispatch = useDispatch();
  const {currentOnlineUsers} = useSelector(state => state.auth);
  const {currentUserId} = useSelector(state => state.auth);

  
  // useListenForRemoveConnectionQuery({currentUserId},
  //   {skip: !currentUserId}, // Skip if no current user ID
  // );

  const {
    data: conversationList = [],
    isLoading: conversationListLoading,
    isFetching: conversationListFetching,
    isError: conversationListError,
  } = useMessageInboxQuery();

  const {data, isLoading} = useListenForOnlineUsersQuery(currentUserId);

  // update the online users when the list changes

  useEffect(() => {
    // Separate and dispatch only if conversationList changes
    if (!conversationListLoading && conversationList) {
      const personalConversationList = conversationList.filter(
        item => !item.isGroup,
      );
      const groupConversationList = conversationList.filter(
        item => item.isGroup,
      );

      if (personalConversationList && personalConversationList.length > 0) {
        

        dispatch(setPersonalConversationList(personalConversationList));
      } else {
        dispatch(setPersonalConversationList([]));
      }

      if (groupConversationList && groupConversationList.length > 0) {
        dispatch(setGroupConversationList(groupConversationList));
      } else {
        dispatch(setGroupConversationList([]));
      }
    }
  }, [conversationListLoading, conversationList]);

  // Detect the online status of users
  // useEffect(() => {
  //   if (socket?.socket) {
  //     socket?.socket?.emit('user_online', currentUserId);
  //     const eventName = `update_online_status`;
  //     socket?.socket?.on(eventName, currentOnlineUsersList => {
  //       const onlineUsersArray = Object.values(currentOnlineUsersList);
  //       setOnlineUsers(onlineUsersArray);
  //     });
  //     return () => {
  //       socket?.socket?.off(eventName);
  //     };
  //   }
  // }, []);

  useEffect(() => {
    // update the list when online users are updated
    dispatch(setCurrentOnlineUsers(data));
  }, [data]);

  return <></>;
};

export default MessageInbox;
