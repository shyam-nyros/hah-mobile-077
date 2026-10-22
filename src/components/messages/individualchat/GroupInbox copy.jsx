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

const GroupInbox = () => {
  const dispatch = useDispatch();
  const {groupConversationList, personalConversationList} = useSelector(
    state => state.message,
  );

  const {currentUserId} = useSelector(state => state.auth);

  // listen for inbox updates - groups
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `message_conversation_list_${currentUserId}`;

      const handleNewMessage = newMsg => {
        // Check if the new item is a new group to be added in inbox
        // use the flag newMsg?.conversation?.isGroup and newMsg?.conversation?.newGroup - to check that
        // also need to check whether it is new group to be added or to delete the group
        // to detect whether to add or remove use the flag correctly

        if (
          newMsg &&
          newMsg?.conversation?.isGroup &&
          newMsg?.conversation?.newGroup
        ) {
          const formattedResponse = {
            ...newMsg?.conversation,
          };
         
          // in the main list newMsg?.conversation?.admin is an array
          // but in the socket it is an object
          // so convert the socket response also to an array before adding it to list
          // formattedResponse.admin = [newMsg?.conversation?.admin];

          const updatedGroupInbox = [
            newMsg?.conversation,
            ...groupConversationList,
          ];
         
          dispatch(setGroupConversationList(updatedGroupInbox));
        }

        // check for group deletion
        if (newMsg && newMsg?.removed) {
       
          const groupId = newMsg?.group;
          const groups = [...groupConversationList];
          setTimeout(() => {
            const updatedGroups = groups.filter(group => group._id !== groupId);
            dispatch(setGroupConversationList(updatedGroups));
          }, 2000);
        }

        // check for new message in group
        // also check this block is not triggered when group added or deleted
        if (
          newMsg &&
          newMsg?.conversation?.isGroup &&
          !newMsg?.removed &&
          !newMsg?.conversation?.newGroup &&
          newMsg?.conversation?.lastMessageDetails
        ) {
         

          const updatedGroupConversation = [...groupConversationList];
       

          const existingIndex = updatedGroupConversation.findIndex(
            item => item._id === newMsg?.conversation?._id,
          );

          if (existingIndex !== -1) {
            // if the match is found
            // Update existing conversation details
            updatedGroupConversation[existingIndex] = {
              ...updatedGroupConversation[existingIndex],
              unreadCount: newMsg?.conversation?.unreadCount || 0,
              lastMessageDetails: {
                ...newMsg?.conversation?.lastMessageDetails,
              },
            };

            // Remove the existing item and re-add to the top
            const [updatedItem] = updatedGroupConversation.splice(
              existingIndex,
              1,
            );
            updatedGroupConversation.unshift(updatedItem);
          }

    

          // perform the sort operation
          // Sort the list based on lastMessageDetails.createdAt in descending order
          const sortedConversations = updatedGroupConversation.sort((a, b) => {
            // Use `lastMessageDetails.createdAt` if it exists; otherwise use createdAt
            const dateA = new Date(
              a.lastMessageDetails?.createdAt || a.createdAt,
            );
            const dateB = new Date(
              b.lastMessageDetails?.createdAt || b.createdAt,
            );
            return dateB - dateA;
          });

          // Dispatch the sorted list to store
          dispatch(setGroupConversationList(sortedConversations));
        }
      };
      // Attach the listener
      socket?.socket?.on(eventName, handleNewMessage);

      // Cleanup listener on unmount
      return () => {
        socket?.socket?.off(eventName, handleNewMessage);
      };
    }
    return () => {};
  }, [currentUserId]);
  // }, [currentUserId, groupConversationList, dispatch]);

  return (
    <>
      <View style={tw`flex-1`}>
        {groupConversationList.length > 0 && (
          <>
            <View style={tw`mx-4 mt-3 -z-100`}>
              <Text style={tw`text-[#040641] text-[18px] font-medium mb-3`}>
                Groups
              </Text>
            </View>
            <View>
              {groupConversationList.map((item, index) => (
                <GroupConversationItem
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

export default GroupInbox;
