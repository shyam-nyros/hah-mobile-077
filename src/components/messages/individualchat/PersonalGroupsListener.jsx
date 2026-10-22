import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import socket from '../../../socket/socket';
import {
  setGroupConversationList,
  setPersonalConversationList,
} from '../../../features/messages/messageSlice';

const PersonalGroupsListener = () => {
  // listen for inbox updates - personal chat
  const {currentUserId} = useSelector(state => state.auth);
  const {personalConversationList, groupConversationList} = useSelector(
    state => state.message,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `message_conversation_list_${currentUserId}`;

      const handleNewMessage = newMsg => {
        // Check if the new item is a personal message to be added in inbox
        // use the flag !newMsg?.conversation?.isGroup - to check that
        if (
          newMsg &&
          newMsg?.conversation?.lastMessageDetails &&
          !newMsg?.conversation?.isGroup
        ) {
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

  // listen for the accept updates
  // useEffect(() => {
  //   if (socket?.socket) {
  //     const eventName = `connection_update_${currentUserId}`;

  //     const handleAcceptUpdates = connectionUpdate => {
  
  //       // Update the conversation list when conversation ID matches
  //       if (connectionUpdate?.connection_request_id) {
  //         const updatedList = personalConversationList.map(conversation =>
  //           conversation?.relationStatus?.connectionId ===
  //           connectionUpdate?.connection_request_id
  //             ? {
  //                 ...conversation,
  //                 relationStatus: {
  //                   ...conversation.relationStatus,
  //                   buttonState: connectionUpdate.buttonState,
  //                 },
  //               }
  //             : conversation,
  //         );
  

  //         // dispatch to Redux instead of calling a use‑state setter
  //         dispatch(setPersonalConversationList(updatedList));
  //       }
  //     };

  //     // listener for inbox
  //     socket?.socket?.on(eventName, handleAcceptUpdates);

  //     // Cleanup listener on unmount
  //     return () => {
  //       socket?.socket?.off(eventName, handleAcceptUpdates);
  //     };
  //   }
  //   return () => {};
  // }, [currentUserId, personalConversationList, dispatch]);

  useEffect(() => {
    if (socket?.socket) {
      const eventName = `connection_update_${currentUserId}`;

      const handleAcceptUpdates = connectionUpdate => {
        

        // Update the conversation list when conversation ID matches
        if (connectionUpdate?.participants) {
          const updatedList = personalConversationList.map(conversation => {
            const conversationParticipants = conversation?.participants;
            const updateParticipants = connectionUpdate?.participants;

            // Check if both arrays have the same participants
            const hasMatchingParticipants =
              conversationParticipants.length === updateParticipants.length &&
              conversationParticipants.every(id =>
                updateParticipants.includes(id),
              );

            return hasMatchingParticipants
              ? {
                  ...conversation,
                  relationStatus: {
                    ...conversation.relationStatus,
                    buttonState: connectionUpdate.buttonState,
                  },
                }
              : conversation;
          });

          
          dispatch(setPersonalConversationList(updatedList));
        }
      };

      // listener for inbox
      socket?.socket?.on(eventName, handleAcceptUpdates);

      // Cleanup listener on unmount
      return () => {
        socket?.socket?.off(eventName, handleAcceptUpdates);
      };
    }
    return () => {};
  }, [currentUserId, personalConversationList, dispatch]);

  // listen for the remove updates
  useEffect(() => {
    if (socket?.socket) {
      const eventName = `message_conversation_removed_${currentUserId}`;

      const handleRemoveUpdates = removedItem => {
        // Update the conversation list when conversation ID matches
        if (removedItem?.conversationId) {
          
          const updatedList = personalConversationList.map(conversation =>
            conversation._id === removedItem.conversationId
              ? {
                  ...conversation,
                  relationStatus: {
                    ...conversation.relationStatus,
                    buttonState: removedItem.buttonState,
                  },
                }
              : conversation,
          );
          

          // dispatch to Redux instead of calling a use‑state setter
          dispatch(setPersonalConversationList(updatedList));
        }
      };

      // listener for inbox
      socket?.socket?.on(eventName, handleRemoveUpdates);

      // Cleanup listener on unmount
      return () => {
        socket?.socket?.off(eventName, handleRemoveUpdates);
      };
    }
    return () => {};
  }, [currentUserId, personalConversationList, dispatch]);

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
  }, [currentUserId, groupConversationList, dispatch]);
  return <></>;
};

export default PersonalGroupsListener;
