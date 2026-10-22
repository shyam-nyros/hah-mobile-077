import socket from '../../socket/socket';
import {rootApiSlice} from '../../store/rootApiSlice';
const MESSAGE_ENDPOINT = '/api/user';

export const chatAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    listenForOnlineUsers: builder.query({
      queryFn: async currentUserId => {
        // Since no actual query is being made, return a successful response
        return {data: []};
      },

      async onCacheEntryAdded(
        arg,
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        const eventName = 'update_online_status';

        try {
          // Emit the user's online status
          socket?.socket?.emit('user_online', arg);

          const handleOnlineUsersUpdate = currentOnlineUsersList => {
            if (
              currentOnlineUsersList &&
              typeof currentOnlineUsersList === 'object'
            ) {
              const onlineUsersArray = Object.values(currentOnlineUsersList);

              updateCachedData(draft => {
                draft.length = 0; // Clear the draft
                draft.push(...onlineUsersArray); // Add new data
              });
            }
          };

          // Attach the socket listener
          socket?.socket?.on(eventName, handleOnlineUsersUpdate);

          // Wait for cache entry removal
          await cacheEntryRemoved;

          // Cleanup
          socket?.socket?.off(eventName, handleOnlineUsersUpdate);
        } catch (error) {
          console.error('Error in onCacheEntryAdded:', error);
        }
      },
    }),

    listenForMessageNotification: builder.query({
      queryFn: async currentUserId => {
        // Initialize the cache with an object containing the unread_count
        return {data: {unread_count: 0}};
      },

      async onCacheEntryAdded(
        arg,
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        const eventName = `message_count_6721ab913bdf350b16264df2`;

        try {
          // Emit the user's online status
          // socket?.socket?.emit(eventName);

          const handleMsgCountUpdate = count => {
            updateCachedData(draft => {
              // Update the unread_count property with the new count value
              draft.unread_count = count.unread_count;
            });
          };

          // Attach the socket listener
          socket?.socket?.on(eventName, handleMsgCountUpdate);

          // Wait for cache entry removal
          await cacheEntryRemoved;

          // Cleanup
          socket?.socket?.off(eventName, handleMsgCountUpdate);
        } catch (error) {
          console.error('Error in onCacheEntryAdded:', error);
        }
      },
    }),

    // send or emit a new individual message
    // when send btn is clicked in the chat screen - CreateMessage.jsx
    // emitIndividualMessage: builder.mutation({
    //   queryFn: async ({recepientId, content}) => {
    //     try {
    //       if (!socket) {
    //         throw new Error('Socket not initialized');
    //       }
    //       //   emit the message
    //       socket?.socket?.emit('individual_message', {
    //         recepient_id: recepientId,
    //         content,
    //       });
    //       return {data: 'Individual Message sent successfully'};
    //     } catch (error) {
    //       return {error: {status: 'SOCKET_ERROR', data: error.message}};
    //     }
    //   },
    // }),

    // new code for text message emit
    emitIndividualTextMessage: builder.mutation({
      queryFn: async ({recepientId, content}) => {
        try {
          if (!socket) {
            throw new Error('Socket not initialized');
          }
          //   emit the message
          socket?.socket?.emit('individual_message', {
            recepient_id: recepientId,
            content,
            type: 'text',
          });
          return {data: 'Individual Message sent successfully'};
        } catch (error) {
          return {error: {status: 'SOCKET_ERROR', data: error.message}};
        }
      },
    }),

    // New function for sending attachments via POST request
    sendIndividualAttachment: builder.mutation({
      query: ({recepientId, attachment, type}) => {
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
          url: `/api/user/conversation/${recepientId}`, // Your endpoint
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
    }),

    // for testing purpose
    // emitIndividualMessage: builder.mutation({
    //   queryFn: async payload => {
    //     try {
    //       if (!socket) {
    //         throw new Error('Socket not initialized');
    //       }

    //       // Transform the payload to match your socket event structure
    //       const socketPayload = {
    //         recepient_id: payload.recepientId,
    //         type: payload.type,
    //         ...(payload.content && {content: payload.content}),
    //         ...(payload.attachment && {attachment: payload.attachment}),
    //       };

    //       // Emit the message with the complete payload
    //       socket?.socket?.emit('individual_message', socketPayload);

    //       return {data: 'Individual Message sent successfully'};
    //     } catch (error) {
    //       return {error: {status: 'SOCKET_ERROR', data: error.message}};
    //     }
    //   },
    // }),

    // with form data setup - not working
    // emitIndividualMessage: builder.mutation({
    //   queryFn: async ({recepientId, content}) => {
    //     try {
    //       if (!socket) {
    //         throw new Error('Socket not initialized');
    //       }

    //       // Create FormData
    //       const formData = new FormData();
    //       formData.append('recepient_id', recepientId);
    //       formData.append('content', content);

    //       // Emit the FormData as a plain object
    //       socket?.socket?.emit('individual_message', {
    //         recepient_id: formData.get('recepient_id'),
    //         content: formData.get('content'),
    //       });

    //       return {data: 'Individual Message sent successfully'};
    //     } catch (error) {
    //       return {error: {status: 'SOCKET_ERROR', data: error.message}};
    //     }
    //   },
    // }),

    // fetch individual messages based on the conversation id
    // used - when chat screen is opened it fetches the msg by conversation id
    // ChatMessageBlock.jsx
    fetchIndividualMessages: builder.query({
      query: ({conversationId, page}) => ({
        url: `api/user/conversations/${conversationId}/messages?page=${page}`,
      }),

      transformResponse: response => {
        // Determine if there are more pages based on the length of the message array
        const hasMore = response.messages.length === 20;
        // const hasMore = response.messages.length > 0;

        return {
          hasMore,
          conversation: response?.conversation[0]?._id,
          blocked: response?.isBlocked,
          participants: response?.conversation[0]?.participants,
          messageList: response.messages, // Retain only messages in the list
        };
      },

      // Serialize cache key combining endpoint name and conversationId
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        return `${endpointName}-${queryArgs.conversationId}`;
      },

      // Merging logic for paginated results
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

      // Force refetch logic to trigger fresh fetch if arguments change
      forceRefetch: ({currentArg, previousArg}) => {
        return (
          !previousArg ||
          currentArg?.conversationId !== previousArg?.conversationId ||
          currentArg?.page !== previousArg?.page
        );
      },

      keepUnusedDataFor: 0, // Set to 0 to discard unused data immediately
    }),

    // individual conversation
    // when there is a conversation id then this socket connection is created
    // this will listen for new messages
    // new messages gets added the fetchIndividualMessages draft list
    listenForIndividualConversation: builder.query({
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
                'fetchIndividualMessages',
                {conversationId},
                draft => {
                  

                  // check for the conversation id
                  if (draft.conversation === conversationId) {
                    // when new message is received check the participants presence and then add to list
                    // otherwise no need to add the message to list
                    if (
                      draft.participants.includes(
                        newMessage?.data?.receiver?._id,
                      ) &&
                      draft.participants.includes(newMessage?.data?.sender?._id)
                    ) {
                      // add new message to the beginning
                      draft.messageList.unshift(newMessage?.data);
                    }
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

    // this didnt work because the cache is not available in the case of first message
    // there will bot be any fetchIndividualMessages draft present in this scenario
    // i.e the chat screen will be empty in this case
    listenForFirstIndividualConversation: builder.query({
      queryFn: async ({currentUserId}) => {
        // Since no actual query is being made, return a successful response
        return {data: null};
      },
      async onCacheEntryAdded(
        {currentUserId},
        {updateCachedData, cacheEntryRemoved, dispatch},
      ) {
        try {
          const conversation = `new_conversation_${currentUserId}`;
          const handleNewMessage = newMessage => {
            // Example: Update cache if needed
            dispatch(
              rootApiSlice.util.updateQueryData(
                'fetchIndividualMessages',
                {currentUserId},
                draft => {
                  // draft.push(newMessage?.data);
                },
              ),
            );
          };
          socket?.socket?.on(conversation, handleNewMessage);
          await cacheEntryRemoved;
          socket?.socket?.off(conversation, handleNewMessage);
        } catch (error) {
          console.error('Socket error:', error);
        }
      },
    }),

    // the personal and group list in the message tab
    messageInbox: builder.query({
      query: () => ({
        url: `api/user/conversations`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.conversations;
      },
      // providesTags: ['Inbox'],
      keepUnusedDataFor: 0,
    }),

    // listen for any changes - either personal or group in the inbox
    listenForInboxUpdates: builder.query({
      queryFn: ({currentUserId}) => ({data: []}), // No HTTP request needed
      async onCacheEntryAdded(
        {currentUserId},
        {cacheDataLoaded, cacheEntryRemoved, updateCachedData, dispatch},
      ) {
        try {
          // Wait for cache to be ready
          await cacheDataLoaded;

          if (!socket?.socket) {
            throw new Error('Socket not initialized');
          }

          const eventName = `message_conversation_list_${currentUserId}`;
          // Handle incoming WebSocket messages

          const handleSocketMessage = newMsg => {
            dispatch(
              rootApiSlice.util.updateQueryData(
                'messageInbox',
                undefined,
                draft => {
                  const existingIndex = draft.findIndex(
                    msg => msg._id === newMsg?.conversation?._id,
                  );

                  if (existingIndex !== -1) {
                    // Existing conversation: Update it
                    const conversation = draft[existingIndex];
                    const {lastMessageDetails, lastMessageByUserDetails} =
                      newMsg.conversation;

                    // Apply content display rules
                    conversation.lastMessageDetails.content =
                      lastMessageDetails.sender === currentUserId ||
                      !lastMessageDetails.isBlocked
                        ? lastMessageDetails.content
                        : lastMessageByUserDetails?.content;

                    // Always update timestamps & unread count
                    conversation.lastMessageDetails.createdAt =
                      lastMessageDetails.createdAt;
                    conversation.unreadCount = newMsg.conversation.unreadCount;

                    // Move to top (most recent)
                    draft.splice(existingIndex, 1);
                    draft.unshift(conversation);
                  } else {
                    // New conversation: Apply the same logic
                    const {lastMessageDetails, lastMessageByUserDetails} =
                      newMsg.conversation;

                    newMsg.conversation.lastMessageDetails.content =
                      lastMessageDetails.sender === currentUserId ||
                      !lastMessageDetails.isBlocked
                        ? lastMessageDetails.content
                        : lastMessageByUserDetails?.content;

                    draft.unshift(newMsg.conversation);
                  }
                },
              ),
            );
          };

          // Set up WebSocket listener
          socket?.socket?.on(eventName, handleSocketMessage);

          // Clean up WebSocket listener on cache entry removal
          await cacheEntryRemoved;
          socket?.socket?.off(eventName, handleSocketMessage);
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
        }
      },
    }),

    // listen for any changes - either personal or group in the inbox
    listenForNotificationCount: builder.query({
      queryFn: async () => ({data: []}), // Required but unused since we handle data via socket
      async onCacheEntryAdded(
        {currentUserId, recepientId},
        {cacheDataLoaded, updateCachedData, cacheEntryRemoved},
      ) {
        if (!socket?.socket) {
          // console.error('Socket not initialized');
          return;
        }

        const eventName = `unread_count_with_sender_${currentUserId}_${recepientId}`;

        try {
          // Wait for cache to load
          await cacheDataLoaded;

          const handleUnreadCount = count => {
            updateCachedData(draft => {
              draft = count.unread_count_with_sender;
              return draft;
            });
          };

          // Listen for updates from the socket
          socket?.socket?.on(eventName, handleUnreadCount);

          // Cleanup function when the cache entry is removed
          await cacheEntryRemoved;
          socket?.socket?.off(eventName, handleUnreadCount);
        } catch (error) {
          console.error('Error in onCacheEntryAdded:', error);
        }
      },
    }),

    // listen for connect with leaders unread count
    listenForConnectLeadersUnreadCount: builder.query({
      queryFn: () => ({data: []}), // No HTTP request needed
      async onCacheEntryAdded(
        {currentUserId, recepientId},
        {cacheDataLoaded, cacheEntryRemoved, updateCachedData, dispatch},
      ) {
        try {
          // Wait for cache to be ready
          await cacheDataLoaded;

          if (!socket?.socket) {
            throw new Error('Socket not initialized');
          }

          const eventName = `unread_count_with_sender_${currentUserId}_${recepientId}`;

          // Handle incoming WebSocket messages
          const handleSocketMessage = count => {
            // Update the cache of messageInbox with new data
            dispatch(
              rootApiSlice.util.updateQueryData(
                'connectWithLeaders',
                {},
                draft => {
                  // Check if the message/conversation already exists in the cache

                  const existingIndex = draft.findIndex(
                    leader => leader._id === recepientId,
                  );

                  if (existingIndex !== -1) {
                    draft[existingIndex].unread_count_with_sender =
                      count?.unread_count_with_sender;
                  }
                },
              ),
            );
          };

          // Set up WebSocket listener
          socket?.socket?.on(eventName, handleSocketMessage);

          // Clean up WebSocket listener on cache entry removal
          await cacheEntryRemoved;
          socket?.socket?.off(eventName, handleSocketMessage);
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
        }
      },
    }),
  }),
});

export const {
  useListenForOnlineUsersQuery,
  useEmitIndividualTextMessageMutation,
  useSendIndividualAttachmentMutation,
  useListenForIndividualConversationQuery,
  useFetchIndividualMessagesQuery,
  useListenForFirstIndividualConversationQuery,
  useMessageInboxQuery,
  useListenForInboxUpdatesQuery,
  useListenForNotificationCountQuery,
  useListenForConnectLeadersUnreadCountQuery,
  useListenForMessageNotificationQuery,
} = chatAPISlice;
