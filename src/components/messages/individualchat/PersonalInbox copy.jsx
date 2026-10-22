import React, {useEffect, useState} from 'react';
import {Button, Text, View} from 'react-native';
import tw from 'twrnc';
import LoadingSpinner from '../../LoadingSpinner';
import {useDispatch, useSelector} from 'react-redux';
import GroupConversationItem from '../groupchat/GroupConversationItem';
import PersonalConversationItem from './PersonalConversationItem';
import GroupSuggestions from './GroupSuggestions';
import {
  resetPersonalItemClicked,
  setGroupConversationList,
  setPersonalConversationList,
} from '../../../features/messages/messageSlice';
import socket from '../../../socket/socket';

const PersonalInbox = () => {
  const dispatch = useDispatch();
  const {groupConversationList, personalConversationList} = useSelector(
    state => state.message,
  );

  const {currentUserId} = useSelector(state => state.auth);

  // listen for inbox updates - personal chat
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `message_conversation_list_${currentUserId}`;

      const handleNewMessage = newMsg => {
        // Check if the new item is a personal message to be added in inbox
        // use the flag !newMsg?.conversation?.isGroup - to check that
        if (newMsg && !newMsg?.conversation?.isGroup) {
    

          const updatedPersonalConversations = [...personalConversationList];

          const existingIndex = updatedPersonalConversations.findIndex(
            msg => msg._id === newMsg?.conversation?._id,
          );

          if (existingIndex !== -1) {
            // if the match is found
            // Update existing conversation details
            updatedPersonalConversations[existingIndex] = {
              ...updatedPersonalConversations[existingIndex],
              unreadCount: newMsg?.conversation?.unreadCount || 0,
              lastMessageDetails: {
                ...newMsg?.conversation?.lastMessageDetails,
              },
            };

            // Remove the existing item and re-add to the top
            const [updatedItem] = updatedPersonalConversations.splice(
              existingIndex,
              1,
            );
            updatedPersonalConversations.unshift(updatedItem);
          } else {
            // Add new conversation to the top
            updatedPersonalConversations.unshift({...newMsg?.conversation});
          }

          // perform the sort operation
          // Sort the list based on lastMessageDetails.createdAt in descending order
          const sortedConversations = updatedPersonalConversations.sort(
            (a, b) => {
              const dateA = new Date(a.lastMessageDetails?.createdAt);
              const dateB = new Date(b.lastMessageDetails?.createdAt);
              return dateB - dateA; // Descending order
            },
          );

          // Dispatch the sorted list to store
          dispatch(setPersonalConversationList(sortedConversations));
        }
      };

      // listener for inbox
      socket?.socket?.on(eventName, handleNewMessage);

      // Cleanup listener on unmount
      return () => {
        socket?.socket?.off(eventName, handleNewMessage);
      };
    }
    return () => {};
  }, [currentUserId, personalConversationList, dispatch]);

  return (
    <>
      <View style={tw`flex-1`}>
        {personalConversationList.length > 0 && (
          <>
            <View style={tw`mx-4 mt-3 -z-100`}>
              <Text style={tw`text-[#040641] text-[18px] font-medium mb-3`}>
                Personnel
              </Text>
            </View>

            <View>
              {personalConversationList.map((item, index) => (
                <PersonalConversationItem
                  chatInfo={item}
                  key={item._id}
                  index={index}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </>
  );
};

export default PersonalInbox;
