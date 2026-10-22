import socket from '../../socket/socket';
import {rootApiSlice} from '../../store/rootApiSlice';
const MESSAGE_ENDPOINT = '/api/user';

export const groupChatAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    // create a new group
    createNewGroupAPI: builder.mutation({
      query: payload => ({
        url: `${MESSAGE_ENDPOINT}/groups`,
        method: 'POST',
        body: payload,
      }),
    }),

    // to show suggested groups
    suggestedGroupsAPI: builder.query({
      query: () => ({
        url: `${MESSAGE_ENDPOINT}/groups/suggestions`,
      }),
      transformResponse: (response, meta, arg) => {
        return response?.suggestions;
      },
      providesTags: ['SuggestedGroups'],
    }),

    // update a group
    updateGroupAPI: builder.mutation({
      query: ({groupId, formData}) => ({
        url: `${MESSAGE_ENDPOINT}/groups/${groupId}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['GroupDetails'],
    }),

    // add new members to group
    addNewMembersToGroupAPI: builder.mutation({
      query: ({groupId, participants}) => {
        // Log the groupId and new participants for debugging purposes
        return {
          url: `${MESSAGE_ENDPOINT}/groups/${groupId}/users`,
          method: 'PUT',
          body: {participants},
        };
      },
      invalidatesTags: ['GroupDetails'],
    }),

    // remove member frm a new group
    removeMemberFromGroupAPI: builder.mutation({
      query: ({groupId, memberId}) => {
        // Log the groupId and new participants for debugging purposes
        return {
          url: `${MESSAGE_ENDPOINT}/groups/${groupId}/user/${memberId}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: ['GroupDetails'],
    }),

    // delete a group
    deleteGroupAPI: builder.mutation({
      query: groupId => ({
        url: `${MESSAGE_ENDPOINT}/groups/${groupId}`,
        method: 'DELETE',
      }),
    }),

    // exit a group
    exitGroupAPI: builder.mutation({
      query: groupId => ({
        url: `${MESSAGE_ENDPOINT}/groups/${groupId}/exit`,
        method: 'PUT',
      }),
    }),

    // join a group
    joinGroupAPI: builder.mutation({
      query: groupId => ({
        url: `${MESSAGE_ENDPOINT}/groups/${groupId}/join`,
        method: 'PUT',
      }),
      keepUnusedDataFor: 0,
      invalidatesTags: ['GroupDetails', 'SuggestedGroups'],
    }),

    // group profile details
    groupProfileDetails: builder.query({
      query: groupId => ({
        url: `${MESSAGE_ENDPOINT}/groups/${groupId}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
      providesTags: ['GroupDetails'],
    }),

    // send or emit a new individual message
    // when send btn is clicked in the chat screen - CreateMessage.jsx
    // send or emit a new message in group chat
    // emitGroupMessage: builder.mutation({
    //   queryFn: async ({groupId, content}) => {
    //     try {
    //       // Emit the message and resolve the mutation
    //       if (!socket?.socket) {
    //         throw new Error('Socket not initialized');
    //       }
    //       socket?.socket?.emit(`group_message`, {
    //         group_id: groupId,
    //         content,
    //       });
    //       return {data: 'Group Message sent successfully'};
    //     } catch (error) {

    //       return {error: {status: 'SOCKET_ERROR', data: error.message}};
    //     }
    //   },
    // }),

    // emit group text message only
    // for file attachments use post request
    emitGroupTextMessage: builder.mutation({
      queryFn: async ({groupId, content}) => {
        try {
          // Emit the message and resolve the mutation
          if (!socket?.socket) {
            throw new Error('Socket not initialized');
          }
          socket?.socket?.emit(`group_message`, {
            group_id: groupId,
            content,
            type: 'text',
          });
          return {data: 'Group Message sent successfully'};
        } catch (error) {
          return {error: {status: 'SOCKET_ERROR', data: error.message}};
        }
      },
    }),

    // New function for sending attachments via POST request
    sendAttachmentInGroup: builder.mutation({
      query: ({groupId, attachment, type}) => {
        // Create FormData for file upload
        const formData = new FormData();

        // Add the file to FormData
        formData.append('attachment', {
          uri: attachment.uri,
          type: attachment.type,
          name: attachment.name,
        });

        // Add other required fields
        formData.append('type', type);

        return {
          url: `/api/user/groups/${groupId}`, // Your endpoint
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),

    // fetch group messages
    fetchGroupMessages: builder.query({
      query: ({conversationId, page}) => ({
        url: `api/user/conversations/${conversationId}/messages?page=${page}`,
      }),
      keepUnusedDataFor: 0,
      // transform the response
      transformResponse: response => {
        const hasMore = response.messages.length === 20;

        return {
          hasMore,
          conversation: response?.conversation[0]?._id,
          participants: response?.conversation[0]?.participants,
          messageList: response.messages,
        };
      },

      // Custom serialization to combine conversationId and page as a cache key
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        // Return a serialized cache key
        return `${endpointName}-${queryArgs.conversationId}`;
      },

      // Merge allows control over pagination and merging new data
      // merge: (existing, incoming, {arg: {page}}) => {
      //   if (page === 1) {
      //     // For the first page, reset the existing data
      //     return incoming;
      //   }
      //   const combined = [...existing, ...incoming];
      //   const uniqueMessage = combined.filter(
      //     (comment, index, self) =>
      //       index === self.findIndex(c => c._id === comment._id),
      //   );
      //   return uniqueMessage;
      // },
      merge: (currentCache, newItems, {arg: {page}}) => {
        if (page === 1) {
          // Reset cache when fetching the first page
          return newItems;
        }

        // Combine existing and incoming messages
        const mergedData = {
          ...currentCache,
          messageList: [
            ...currentCache.messageList,
            ...newItems.messageList,
          ].filter(
            (message, index, self) =>
              index === self.findIndex(m => m._id === message._id), // Remove duplicates based on '_id'
          ),
          hasMore: newItems.hasMore, // Update hasMore flag based on the latest response
        };

        return mergedData;
      },
      // Force refetch logic to trigger a fresh fetch under certain conditions
      forceRefetch: ({currentArg, previousArg}) => {
        // Force refetch if conversationId changes or page changes
        // return (
        //   currentArg?.conversationId !== previousArg?.conversationId ||
        //   currentArg?.page !== previousArg?.page
        // );
        return (
          !previousArg || // no args
          currentArg?.conversationId !== previousArg?.conversationId ||
          currentArg?.page !== previousArg?.page
        );
      },
    }),

    // group conversation
    // when there is a conversation id then this socket connection is created
    // this will listen for new messages in group
    // new messages gets added the fetchGroupMessages draft list
    listenForNewMessageInGroup: builder.query({
      queryFn: async ({conversationId}) => {
        // Since no actual query is being made, return a successful response
        return {data: null};
      },
      async onCacheEntryAdded(
        {conversationId},
        {updateCachedData, cacheEntryRemoved, dispatch},
      ) {
        try {
          const conversation = `conversation_${conversationId}`;
          // Listen for new messages from the server
          const handleNewMessage = newMessage => {
            dispatch(
              rootApiSlice.util.updateQueryData(
                'fetchGroupMessages',
                {conversationId},
                draft => {
                  // check for the conversation id
                  if (draft.conversation === conversationId) { 
                    draft.messageList.unshift(newMessage?.data);
                  }
                },
              ),
            );
          };

          // Listen to the `individual_message` event for incoming messages
          socket?.socket?.on(conversation, handleNewMessage);

          // Wait for the cache entry to be removed (e.g., component unmounts)
          await cacheEntryRemoved;

          // Cleanup: Remove the listener and leave the room
          socket?.socket?.off(conversation, handleNewMessage);
        } catch (error) {
          console.error('Socket error:', error);
        }
      },
    }),
  }),
});

export const {
  useCreateNewGroupAPIMutation,
  useSuggestedGroupsAPIQuery,
  useAddNewMembersToGroupAPIMutation,
  useRemoveMemberFromGroupAPIMutation,
  useDeleteGroupAPIMutation,
  useJoinGroupAPIMutation,
  useExitGroupAPIMutation,
  useUpdateGroupAPIMutation,
  useEmitGroupTextMessageMutation,
  useSendAttachmentInGroupMutation,
  useFetchGroupMessagesQuery,
  useListenForNewMessageInGroupQuery,
  useGroupProfileDetailsQuery,
} = groupChatAPISlice;
