import socket from '../../socket/socket';
import {rootApiSlice} from '../../store/rootApiSlice';
const MESSAGE_ENDPOINT = '/api/user';

function updateFollowingProperty(data, recipientId) {
  // Iterate over all categories in the data
  for (const category of Object.keys(data)) {
    const categoryArray = data[category];

    // Check if the categoryArray exists and is an array
    if (Array.isArray(categoryArray)) {
      // Iterate through the array and update the matching items
      categoryArray.forEach(person => {
        if (person._id === recipientId) {
          person.isFollowing = !person.isFollowing; // Toggle the `following` property
        }
      });
    }
  }

  // Return the updated data in its original format
  return data;
}

function updateButtonStateInMsgSearchTab(data, recipientId, buttonState) {
  // Iterate over all categories in the data
  for (const category of Object.keys(data)) {
    const categoryArray = data[category];

    // Check if the categoryArray exists and is an array
    if (Array.isArray(categoryArray)) {
      // Iterate through the array and update the matching items
      categoryArray.forEach(person => {
        if (person._id === recipientId) {
          console.log('MATCH FOUND >>>>>');
          person.isFollowing = !person.isFollowing; // Toggle the `following` property
          person.relationStatus.buttonState = buttonState;
        }
      });
    }
  }

  // Return the updated data in its original format
  return data;
}

export const messageAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    messageTabSearchAPI: builder.query({
      query: ({search}) => ({
        url: `api/user/conversations/search?query=${search}`,
      }),
      serializeQueryArgs: ({endpointName}) => endpointName,
      forceRefetch: ({currentArg, previousArg}) => currentArg !== previousArg,
      transformResponse: (response, meta, arg) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),

    // follow a user
    followUserAPI: builder.mutation({
      query: ({recipientId}) => ({
        url: `${MESSAGE_ENDPOINT}/follow/${recipientId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['FollowingUser'],
      async onQueryStarted({recipientId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              updateFollowingProperty(draft, recipientId); // Modify all occurrences in the draft
            },
          ),
        );

        // Optimistically update the `chatWithFriendsList` query
        const chatWithFriendsPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'chatWithFriendsList',
            undefined,
            draft => {
              draft.forEach(person => {
                if (person._id === recipientId) {
                  person.isFollowing = !person.isFollowing; // Toggle the `following` property
                }
              });
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
          chatWithFriendsPatchResult.undo();
        }
      },
    }),

    // unfollow a user
    unFollowUserAPI: builder.mutation({
      query: ({recipientId}) => ({
        url: `${MESSAGE_ENDPOINT}/unfollow/${recipientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FollowingUser'],
      async onQueryStarted({recipientId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              updateFollowingProperty(draft, recipientId); // Set `isFollowing` to `false`
            },
          ),
        );

        // Optimistically update the `chatWithFriendsList` query
        const chatWithFriendsPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'chatWithFriendsList',
            undefined,
            draft => {
              draft.forEach(person => {
                if (person._id === recipientId) {
                  person.isFollowing = false; // Set `following` to `false`
                }
              });
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
          chatWithFriendsPatchResult.undo();
        }
      },
    }),

    // follow a leader
    followLeaderAPI: builder.mutation({
      query: ({recipientId}) => ({
        url: `${MESSAGE_ENDPOINT}/follow/${recipientId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['FollowingLeaders', 'SuggestedForYouNotifications'],

      async onQueryStarted({recipientId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `suggestedForYouAPI` query
        const suggestedLeadersForYouPatch = dispatch(
          rootApiSlice.util.updateQueryData(
            'suggestedForYouAPI',
            undefined,
            draft => {
              draft.forEach(person => {
                if (person._id === recipientId) {
                  person.isFollowing = !person.isFollowing;
                }
              });
            },
          ),
        );

        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              updateFollowingProperty(draft, recipientId); // Modify all occurrences in the draft
            },
          ),
        );

        // Optimistically update the `connectWithLeaders` query
        const connectWithLeadersPatchUpdate = dispatch(
          rootApiSlice.util.updateQueryData(
            'connectWithLeaders',
            undefined,
            draft => {
              draft.forEach(person => {
                if (person._id === recipientId) {
                  person.isFollowing = !person.isFollowing; // Toggle the `following` property
                }
              });
            },
          ),
        );

        // Optimistically update the `leaderProfileAPI` query
        const leaderProfilePatchUpdate = dispatch(
          rootApiSlice.util.updateQueryData(
            'leaderProfileAPI',
            undefined,
            draft => {
              draft.isFollowing = true;
              draft.followers_count = draft.followers_count + 1;
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
          connectWithLeadersPatchUpdate.undo();
          leaderProfilePatchUpdate.undo();
          leaderProfilePatchUpdate.undo();
          suggestedLeadersForYouPatch.undo();
        }
      },
    }),

    // unfollow a user
    unFollowLeaderAPI: builder.mutation({
      query: ({recipientId}) => ({
        url: `${MESSAGE_ENDPOINT}/unfollow/${recipientId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FollowingLeaders'],
      async onQueryStarted({recipientId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              updateFollowingProperty(draft, recipientId); // Modify all occurrences in the draft
            },
          ),
        );

        // Optimistically update the `chatWithFriendsList` query
        const chatWithFriendsPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'connectWithLeaders',
            undefined,
            draft => {
              draft.forEach(person => {
                if (person._id === recipientId) {
                  person.isFollowing = !person.isFollowing; // Toggle the `following` property
                }
              });
            },
          ),
        );

        // Optimistically update the `leaderProfileAPI` query
        const leaderProfilePatchUpdate = dispatch(
          rootApiSlice.util.updateQueryData(
            'leaderProfileAPI',
            undefined,
            draft => {
              draft.followers_count = draft.followers_count - 1;
              draft.isFollowing = false;
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
          chatWithFriendsPatchResult.undo();
          leaderProfilePatchUpdate.undo();
        }
      },
    }),

    // followers list
    followingUsersList: builder.query({
      query: ({page, keyword}) => {
        const searchParam = keyword ? `&search=${keyword}` : '';
        return {
          url: `${MESSAGE_ENDPOINT}/following?page=${page}`,
        };
      },
      transformResponse: (response, meta, arg) => {
        return response.followings;
      },
      serializeQueryArgs: ({endpointName}) => endpointName,

      forceRefetch({currentArg, previousArg}) {
        if (previousArg === undefined) {
          return true;
        }

        return (
          currentArg?.page !== previousArg?.page ||
          currentArg?.keyword !== previousArg?.keyword
        );
      },
      merge: (currentCache, newItems, {arg}) => {
        const {page} = arg;
        if (page === 1) {
          return newItems;
        }
        // Combine the current cache and new items, then remove duplicates
        const mergedData = [...currentCache, ...newItems].filter(
          (item, index, self) =>
            index === self.findIndex(i => i._id === item._id), // Keep only the first occurrence of each unique item by 'id'
        );
        return mergedData;
      },
      providesTags: ['FollowingUser'],
    }),

    // this api is used for fetching converation id for the search items (message tab search items)
    // the conversation id is fetched based on user id
    // if no conversation id then null is returned as response
    getConversationIdByUserIdAPI: builder.query({
      query: ({userId}) => ({
        url: `api/user/conversation/${userId}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response;
      },
      keepUnusedDataFor: 0,
    }),

    personalConversationAPI: builder.query({
      query: ({page}) => ({
        url: `api/user/conversations?page=${page}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.conversations;
      },
      // providesTags: ['PersonalList'],
      keepUnusedDataFor: 0,
    }),

    updateReadStatusAPI: builder.query({
      query: ({conversationId, messageId}) => ({
        url: `/api/user/conversations/${conversationId}/messages/${messageId}`,
      }),
    }),

    chatMessagesById: builder.query({
      query: ({id, page}) => ({
        url: `api/user/conversations/${id}/messages?page=${page}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.messages;
      },
    }),

    conversationsAPI: builder.query({
      // Query to fetch paginated messages
      query: ({conversationId, page}) => ({
        url: `api/user/conversations/${conversationId}/messages?page=${page}`,
      }),
      // Option to transform response if needed
      transformResponse: response => {
        return response.messages.reverse();
      },
      keepUnusedDataFor: 0,
      // Custom serialization to combine conversationId and page as a cache key
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        // Return a serialized cache key
        return `${endpointName}-${queryArgs.conversationId}`;
      },

      // Merge allows control over pagination and merging new data
      merge: (existing, incoming, {arg: {page}}) => {
        if (page === 1) {
          // For the first page, reset the existing data
          return incoming;
        }

        // Combine existing and incoming messages and filter out duplicates based on _id
        const combined = [...existing, ...incoming];
        const uniqueMessages = combined.filter(
          (message, index, self) =>
            index === self.findIndex(m => m._id === message._id),
        );

        return uniqueMessages;
      },

      // Force refetch logic to trigger a fresh fetch under certain conditions
      forceRefetch: ({currentArg, previousArg}) => {
        // Force refetch if conversationId or page changes
        return (
          currentArg?.conversationId !== previousArg?.conversationId ||
          currentArg?.page !== previousArg?.page
        );
      },

      // WebSocket handling for real-time updates
      async onCacheEntryAdded(
        {conversationId},
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        const conversation = `conversation_${conversationId}`;
        const seenStatus = `conversation_seen_by_${conversationId}`;
        let isCacheRemoved = false;

        try {
          // Wait for the cache data to load
          await cacheDataLoaded;

          // If cache was removed during data loading, skip setting up WebSockets
          if (isCacheRemoved) return;

          if (!socket) {
            throw new Error('Socket not initialized');
          }

          // Set up WebSocket connection for new messages
          socket?.socket?.on(conversation, newMessage => {
            // Update cached data with the new WebSocket message
            updateCachedData(draft => {
              draft.push(newMessage.data); // Add the new message
            });
          });

          // Set up WebSocket connection for seen status updates
          socket?.socket?.on(seenStatus, seenUpdate => {
            // Update cached data to reflect the seen status update
            updateCachedData(draft => {
              draft.forEach(message => {
                message.seenBy = seenUpdate?.data?.seenBy?.seenBy;
                // if (message._id === seenUpdate.messageId) {
                //   message.seenBy = seenUpdate.seenBy; // Update the seen status
                // }
              });
            });
          });
        } catch (err) {
          console.error('Error with WebSocket:', err);
        } finally {
          // Ensure WebSocket is cleaned up when the cache entry is removed
          cacheEntryRemoved.then(() => {
            isCacheRemoved = true;
            socket?.socket?.off(conversation);
            socket?.socket?.off(seenStatus);
          });
        }
      },
    }),

    individualProfileDetails: builder.query({
      query: userId => ({
        url: `${MESSAGE_ENDPOINT}/${userId}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),

    // function based on new updates
    // send connection request
    sendConnectionRequest: builder.mutation({
      query: ({oppositeUserId}) => ({
        url: `${MESSAGE_ENDPOINT}/connect/${oppositeUserId}`,
        method: 'POST',
      }),

      // update the search api draft
      async onQueryStarted({oppositeUserId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              console.log('SEARCH DRAFT IS ...');

              console.log(JSON.stringify(draft));
              updateButtonStateInMsgSearchTab(
                draft,
                oppositeUserId,
                'withdraw',
              );
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
        }
      },
      invalidatesTags: ['FollowingUser', 'ConnectionStatus'],
    }),

    // accept connection request
    acceptConnectionRequest: builder.mutation({
      query: ({oppositeUserId}) => ({
        url: `${MESSAGE_ENDPOINT}/accept/${oppositeUserId}`,
        method: 'POST',
      }),
      // update the search api draft
      async onQueryStarted({oppositeUserId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              console.log('SEARCH DRAFT IS ...');

              console.log(JSON.stringify(draft));
              updateButtonStateInMsgSearchTab(draft, oppositeUserId, 'remove');
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
        }
      },
      invalidatesTags: ['FollowingUser', 'ConnectionStatus'],
    }),

    // withdraw connection request
    withdrawConnectionRequest: builder.mutation({
      query: ({oppositeUserId}) => ({
        url: `${MESSAGE_ENDPOINT}/withdraw/${oppositeUserId}`,
        method: 'POST',
      }),
      // update the search api draft
      async onQueryStarted({oppositeUserId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              console.log('SEARCH DRAFT IS ...');

              console.log(JSON.stringify(draft));
              updateButtonStateInMsgSearchTab(draft, oppositeUserId, 'connect');
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
        }
      },

      invalidatesTags: ['FollowingUser', 'ConnectionStatus'],
    }),

    // ignore connection request
    ignoreConnectionRequest: builder.mutation({
      query: ({oppositeUserId}) => ({
        url: `${MESSAGE_ENDPOINT}/ignore/${oppositeUserId}`,
        method: 'POST',
      }),
      // update the search api draft
      async onQueryStarted({oppositeUserId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              console.log('SEARCH DRAFT IS ...');

              console.log(JSON.stringify(draft));
              updateButtonStateInMsgSearchTab(draft, oppositeUserId, 'connect');
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
        }
      },
      invalidatesTags: ['FollowingUser', 'ConnectionStatus'],
    }),

    // remove connection request
    removeConnectionRequest: builder.mutation({
      query: ({oppositeUserId}) => ({
        url: `${MESSAGE_ENDPOINT}/remove/${oppositeUserId}`,
        method: 'POST',
      }),
      // update the search api draft
      async onQueryStarted({oppositeUserId}, {dispatch, queryFulfilled}) {
        // Optimistically update the `messageTabSearchAPI` query
        const messageTabPatchResult = dispatch(
          rootApiSlice.util.updateQueryData(
            'messageTabSearchAPI',
            undefined,
            draft => {
              console.log('SEARCH DRAFT IS ...');

              console.log(JSON.stringify(draft));
              updateButtonStateInMsgSearchTab(draft, oppositeUserId, 'connect');
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          // Revert optimistic updates for both queries
          messageTabPatchResult.undo();
        }
      },
      invalidatesTags: ['FollowingUser', 'ConnectionStatus'],
    }),

    // get the connection status between two users and based on the relation render the buttons
    getConnectionStatus: builder.query({
      query: oppositeUserId => ({
        url: `api/user/status/${oppositeUserId}`,
      }),
      providesTags: ['ConnectionStatus'],
      keepUnusedDataFor: 0,
    }),

    // listen for request connections updates
    // the update happens through web sockets when the opposite user triggers an event like connect withdraw etc
    // for exaple when the current USER A is in USER B profile page and when USER B send req to USER A then the button needs to be updated instantly as accept for USER A
    listenForRequestConnectionUpdates: builder.query({
      queryFn: async () => {
        return {data: null};
      },

      async onCacheEntryAdded(
        {currentUserId, oppositeUserId},
        {cacheEntryRemoved, dispatch},
      ) {
        // console.log('USER ID IS = ');
        console.log('current user id = ' + currentUserId);
        console.log('opposite user id = ' + oppositeUserId);

        try {
          const connectionEvent = `connection_update_${currentUserId}`;
          console.log(connectionEvent);

          const handleConnectionUpdate = updateData => {
            console.log('CONNECTION UPDATE RECEIVED.....', updateData);

            // 🔥 ADD THIS FILTERING LOGIC AT THE TOP
            const targetUserId =
              updateData?.requester?.id ||
              updateData?.accepter?.id ||
              updateData?.ignorer?.id ||
              updateData?.withdrawer?.id ||
              updateData?.remover?.id;

            // Only process if this update is for our specific oppositeUserId
            if (targetUserId !== oppositeUserId) {
              console.log(
                `Ignoring update for user ${targetUserId}, expected ${oppositeUserId}`,
              );
              return; // Skip this update - this is the key fix!
            }

            console.log(`Processing update for correct user: ${targetUserId}`);

            // Now proceed with your existing cache updates
            dispatch(
              rootApiSlice.util.updateQueryData(
                'getConnectionStatus',
                updateData?.requester?.id ||
                  updateData?.accepter?.id ||
                  updateData?.ignorer?.id ||
                  updateData?.withdrawer?.id ||
                  updateData?.remover?.id,
                draft => {
                  console.log('Updating connection status cache for:');
                  if (draft) {
                    draft.buttonState = updateData.buttonState;
                  } else {
                    console.log('No draft found for requester ID:');
                  }
                },
              ),
            );

            dispatch(
              rootApiSlice.util.updateQueryData(
                'chatWithFriendsList',
                undefined,
                draft => {
                  console.log(
                    'Updating connection status cache for chat with friends:',
                  );

                  if (draft) {
                    console.log('DRAFT LOG');
                    console.log(JSON.stringify(draft));

                    // Find the user by oppositeUserId (matching with _id in draft)
                    const userIndex = draft.findIndex(
                      user => user._id === oppositeUserId,
                    );

                    console.log('USER INDEX IS >>>>>', userIndex);

                    if (userIndex !== -1) {
                      // Update the buttonState for the found user
                      draft[userIndex].buttonState = updateData.buttonState;
                      // draft[userIndex].connectionStatus = 'accepted';

                      console.log(
                        `Updated buttonState for user ${draft[userIndex].first_name} ${draft[userIndex].last_name}`,
                      );
                      console.log(JSON.stringify(draft));
                      return draft;
                    } else {
                      console.log(
                        'No user found with oppositeUserId:',
                        oppositeUserId,
                      );
                      return draft;
                    }
                  } else {
                    console.log(
                      'No draft found for oppositeUserId:',
                      oppositeUserId,
                    );
                    return null;
                  }
                },
              ),
            );
          };

          socket?.socket?.on(connectionEvent, handleConnectionUpdate);
          await cacheEntryRemoved;
          socket?.socket?.off(connectionEvent, handleConnectionUpdate);
        } catch (error) {
          console.error('Connection socket error:', error);
        }
      },
    }),

    // listen for the remove event - when two users are connected and when any one
    // user clicks on remove then in the conversation list the button state needs
    // to be updated as connect - so that when clicked on the list item it will navigate
    // to profile page instead of going to chat screen. Because the navigation to profile or chat screen
    // is based on the button state i.e if both are connected then navigate to chat screen otherwise navigate to
    // profile screen
    // listenForRemoveConnection: builder.query({
    //   queryFn: async () => {
    //     return {data: null};
    //   },

    //   async onCacheEntryAdded({currentUserId}, {cacheEntryRemoved, dispatch}) {
    //     try {
    //       const removeConnectionEvent = `message_conversation_removed_${currentUserId}`;

    //       const handleRemoveConnection = updateData => {
    //         console.log(
    //           'REMOVE CONNECTION UPDATE RECEIVED FROM WS??.....',
    //           updateData,
    //         );

    //         // Update the inbox cache
    //         dispatch(
    //           rootApiSlice.util.updateQueryData(
    //             'messageInbox',
    //             undefined, // Keep this if messageInbox doesn't take parameters
    //             draft => {
    //               console.log('Inbox cache draft:', JSON.stringify(draft));

    //               if (updateData?.conversationId) {
    //                 console.log(
    //                   'Updating conversation with ID:',
    //                   updateData.conversationId,
    //                 );

    //                 // Find and update the conversation
    //                 const conversationIndex = draft.findIndex(
    //                   conversation =>
    //                     conversation._id === updateData.conversationId,
    //                 );

    //                 if (conversationIndex !== -1) {
    //                   // Update the conversation's relation status
    //                   draft[conversationIndex] = {
    //                     ...draft[conversationIndex],
    //                     relationStatus: {
    //                       ...draft[conversationIndex].relationStatus,
    //                       buttonState: updateData.buttonState, // Fixed: was removedItem.buttonState
    //                     },
    //                   };

    //                   console.log(
    //                     'Updated conversation:',
    //                     JSON.stringify(draft[conversationIndex]),
    //                   );
    //                 } else {
    //                   console.log('Conversation not found in cache');
    //                 }
    //               } else {
    //                 console.log('Invalid updateData');
    //               }
    //             },
    //           ),
    //         );
    //       };

    //       socket?.socket?.on(removeConnectionEvent, handleRemoveConnection);
    //       await cacheEntryRemoved;
    //       socket?.socket?.off(removeConnectionEvent, handleRemoveConnection);
    //     } catch (error) {
    //       console.error('Remove connection socket error:', error);
    //     }
    //   },
    // }),

    // fetch accepted connections for add-members flow
    myConnections: builder.query({
      query: ({page = 1, limit = 20, search = ''} = {}) => {
        let url = `${MESSAGE_ENDPOINT}/my-connections?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return {url};
      },
      transformResponse: response => response?.users ?? [],
    }),
  }),
});

export const {
  useMessageTabSearchAPIQuery,
  usePersonalConversationAPIQuery,
  useGetConversationIdByUserIdAPIQuery,
  useUpdateReadStatusAPIQuery,
  useChatMessagesByIdQuery,
  useConversationsAPIQuery,
  useFollowUserAPIMutation,
  useUnFollowUserAPIMutation,
  useFollowLeaderAPIMutation,
  useUnFollowLeaderAPIMutation,
  useFollowingUsersListQuery,
  useIndividualProfileDetailsQuery,
  // new functions
  useSendConnectionRequestMutation,
  useAcceptConnectionRequestMutation,
  useIgnoreConnectionRequestMutation,
  useWithdrawConnectionRequestMutation,
  useRemoveConnectionRequestMutation,
  useGetConnectionStatusQuery,
  useListenForRequestConnectionUpdatesQuery,
  // useListenForRemoveConnectionQuery,
  useMyConnectionsQuery,
} = messageAPISlice;
