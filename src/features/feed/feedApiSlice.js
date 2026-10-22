import socket from '../../socket/socket';
import {rootApiSlice} from '../../store/rootApiSlice';

const FEED_ENDPOINT = '/api/posts';

export const feedApiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    //  fetch posts list
    feedListAPI: builder.query({
      query: currentPage => ({
        url: `${FEED_ENDPOINT}/?page=${currentPage}`,
      }),
      keepUnusedDataFor: 0,
      providesTags: ['Post'],
      transformResponse: (response, meta, arg) => {
        // add the hasMore flag to apply pagination in component
        // hasMore flag is based on array length
        const hasMore = response.posts.length === 20; //each page has 20 items
        return {
          hasMore,
          list: response.posts,
        };
      },
      serializeQueryArgs: ({endpointName}) => endpointName,

      forceRefetch: ({currentArg, previousArg}) => currentArg !== previousArg,
      merge: (currentCache, newItems, arg) => {
        if (arg.arg === 1) {
          return newItems; // Reset cache if it's the first page
        }
        // Combine the current cache and new items, then remove duplicates
        const mergedData = {
          list: [...currentCache.list, ...newItems.list].filter(
            (item, index, self) =>
              index === self.findIndex(i => i._id === item._id), // Keep only the first occurrence of each unique item by '_id'
          ),
          hasMore: newItems?.hasMore, // Update `hasMore` based on the latest response
        };

        return mergedData;
      },
    }),

    // create a new post
    createPostAPI: builder.mutation({
      query: data => ({
        url: `${FEED_ENDPOINT}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post'],
      // manual cache update to push new item into the draft
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        try {
          const {data: newPost} = await queryFulfilled;

          const formattedNewPost = {
            _id: newPost.post._id,
            likes_count: newPost.post.likes_count,
            comments_count: newPost.post.comments_count,
            shares_count: newPost.post.shares_count,
            title: newPost.post.title,
            author: {
              profile_image: newPost.post.author.profile_image,
              full_name: newPost.post.author.full_name,
              is_leader: newPost.post.author.is_leader,
            },
            description: newPost.post.description,
            type: newPost.post.type,
            createdAt: newPost.post.createdAt,
            user_liked: newPost.post.likes_count,
            attachment: newPost.post.attachment,
          };
          dispatch(
            rootApiSlice.util.updateQueryData(
              'feedListAPI',
              undefined,
              draft => {
                draft?.list?.unshift(formattedNewPost);
              },
            ),
          );
        } catch (error) {}
      },
    }),

    // fetch post details by postId
    postDetailsAPI: builder.query({
      query: postId => ({
        url: `${FEED_ENDPOINT}/${postId}`,
      }),
      transformResponse: response => response.posts[0],
      serializeQueryArgs: ({endpointName}) => endpointName,
      keepUnusedDataFor: 0,
    }),
    
    // create a new comment
    createCommentAPI: builder.mutation({
      query: ({postId, content}) => ({
        url: `${FEED_ENDPOINT}/${postId}/comment`,
        method: 'POST',
        body: {content},
      }),
      // invalidatesTags: ['Comment'],
    }),

    // LIKE POST
    likePostAPI: builder.mutation({
      query: ({postId}) => ({
        url: `${FEED_ENDPOINT}/${postId}/like`,
        method: 'POST',
      }),
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        // Optimistic update: immediately update the UI for both list and details
        const patchFeedList = dispatch(
          rootApiSlice.util.updateQueryData('feedListAPI', undefined, draft => {
            const postToBeUpdated = draft?.list?.find(
              item => item._id === args.postId,
            );
            if (postToBeUpdated) {
              postToBeUpdated.user_liked = true;
              postToBeUpdated.likes_count++;
              // postToBeUpdated.likes_count = postToBeUpdated.likes_count + 1;
            }
          }),
        );

        const patchPostDetails = dispatch(
          rootApiSlice.util.updateQueryData(
            'postDetailsAPI',
            args.postId,
            draft => {
              draft.user_liked = true;
              draft.likes_count++;
            },
          ),
        );

        try {
          // Wait for the server response
          const {data: response} = await queryFulfilled;
        } catch (error) {
          // Rollback on failure: undo both optimistic updates
          patchFeedList.undo();
          patchPostDetails.undo();
        }
      },
    }),

    // UNLIKE POST
    unLikePostAPI: builder.mutation({
      query: ({postId}) => ({
        url: `${FEED_ENDPOINT}/${postId}/unlike`,
        method: 'PUT',
      }),
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        // Optimistic update: immediately update the UI for both list and details
        const patchFeedList = dispatch(
          rootApiSlice.util.updateQueryData('feedListAPI', undefined, draft => {
            const postToBeUpdated = draft?.list?.find(
              item => item._id === args.postId,
            );
            if (postToBeUpdated) {
              postToBeUpdated.user_liked = false;
              postToBeUpdated.likes_count--;
              // postToBeUpdated.likes_count = postToBeUpdated.likes_count - 1;
            }
          }),
        );

        const patchPostDetails = dispatch(
          rootApiSlice.util.updateQueryData(
            'postDetailsAPI',
            args.postId,
            draft => {
              draft.user_liked = false;
              draft.likes_count--;
            },
          ),
        );

        try {
          // Wait for the server response
          const {data: response} = await queryFulfilled;
        } catch (error) {
          // Rollback on failure: undo both optimistic updates
          patchFeedList.undo();
          patchPostDetails.undo();
        }
      },
    }),

    // socket connection for likes count
    getPostLikes: builder.query({
      queryFn: () => {
        // return {data: []};
        return {data: {likes: {}}};
      },
      async onCacheEntryAdded(
        postId,
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        try {
          await cacheDataLoaded;

          const postName = `post_likes_${postId}`;
          const handleNewMessage = newMessage => {
            const likesString = newMessage?.data?.likes;
            // Convert the likes value to a number
            const likes = Number(likesString);
            // Only update if `likes` is a valid number and greater than zero
            if (!isNaN(likes)) {
              updateCachedData(draft => {
                draft.likes = likes;
              });
            }
          };
          socket?.socket?.on(postName, handleNewMessage);
          await cacheEntryRemoved;
          socket?.socket?.off(postName, handleNewMessage);
        } catch (error) {
          console.error('WebSocket connection failed:', error);
        }
      },
    }),

    // socket connection for new comments count
    getCommentsCount: builder.query({
      queryFn: () => {
        return {data: {comments: {}}};
      },
      providesTags: ['Comment'],
      async onCacheEntryAdded(
        postId,
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        try {
          await cacheDataLoaded;

          const postName = `post_comments_${postId}`;
          const handleNewMessage = newMessage => {
            const commentsString = newMessage?.comments_count;
            // Convert the likes value to a number
            const comments = Number(commentsString);
            // Only update if `comments` is a valid number and greater than zero
            if (!isNaN(comments)) {
              updateCachedData(draft => {
                draft.comments = newMessage.comments_count;
              });
            }
          };
          socket?.socket?.on(postName, handleNewMessage);
          await cacheEntryRemoved;
          socket?.socket?.off(postName, handleNewMessage);
        } catch (error) {
          console.error('WebSocket connection failed:', error);
        }
      },
    }),

    // socket connection to receive new comments
    newCommentsByPostIdAPI: builder.query({
      query: ({postId, page}) => ({
        url: `${FEED_ENDPOINT}/${postId}/comments?page=${page}`,
      }),
      transformResponse: response => {
        // Assuming that 10 is the limit per page for notifications
        const hasMore = response?.comments?.length === 20;
        return {
          hasMore,
          list: response.comments,
        };
      },
      serializeQueryArgs: ({endpointName, queryArgs}) =>
        `${endpointName}-${queryArgs.postId}`,

      merge: (existing, incoming, {arg: {page}}) => {
        if (page === 1) return incoming;

        const mergedData = {
          list: [...existing.list, ...incoming.list],
          hasMore: incoming?.hasMore, // Update `hasMore` based on the latest response
        };

        return mergedData;

        // const combined = [...existing.list, ...incoming.list];
        // const uniqueComments = combined.filter(
        //   (comment, index, self) =>
        //     index === self.findIndex(c => c._id === comment._id),
        // );
        // return uniqueComments;
        // return combined
      },
      forceRefetch: ({currentArg, previousArg}) =>
        currentArg?.postId !== previousArg?.postId ||
        currentArg?.page !== previousArg?.page,
      async onCacheEntryAdded(
        {postId},
        {updateCachedData, cacheDataLoaded, cacheEntryRemoved},
      ) {
        const postName = `post_comments_${postId}`;

        try {
          await cacheDataLoaded;

          // Set up WebSocket to listen for new comments
          socket?.socket?.on(postName, newComment => {
            if (newComment && newComment.comment && newComment.comment._id) {
              // Validate incoming data

              const newCommentToBeAdded = {
                _id: newComment.comment._id,
                createdAt: newComment.comment.createdAt,
                content: newComment.comment.content,
                authorDetails: {
                  _id: newComment.user._id,
                  full_name: newComment.user.username,
                  profile_image: newComment.user.profile_pic,
                },
              };

              updateCachedData(draft => {
                draft?.list?.unshift(newCommentToBeAdded); // Add the new comment at the top
              });
            }
          });
        } catch (err) {
          console.error('Error with WebSocket:', err);
        }

        await cacheEntryRemoved;
        socket?.socket?.off(postName); // Clean up when cache entry is removed
      },
    }),

    deleteCommentAPI: builder.mutation({
      query: ({postId, commentId}) => ({
        url: `${FEED_ENDPOINT}/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      async onQueryStarted({postId, commentId}, {queryFulfilled, dispatch}) {
        try {
          // Wait for the delete action to be confirmed by the server
          const {data: response} = await queryFulfilled;

          // Update the comments list in the cache (remove the deleted comment)
          dispatch(
            rootApiSlice.util.updateQueryData(
              'newCommentsByPostIdAPI',
              {postId}, // Use the same structure as used in the cache key for newCommentsByPostIdAPI
              draft => {
                // Filter out the deleted comment by its ID
                // return draft?.list?.filter(comment => comment._id !== commentId);
                const filteredComments = draft?.list?.filter(
                  comment => comment._id !== commentId,
                );

                return {
                  hasMore: draft?.hasMore,
                  list: filteredComments,
                };
              },
            ),
          );

          // Update the comments count in the cache
          dispatch(
            rootApiSlice.util.updateQueryData(
              'getCommentsCount',
              postId, // If `postId` is the only argument for `getCommentsCount`, pass it directly
              draft => {
                draft.comments = response.comments_count;
              },
            ),
          );
        } catch (error) {
          console.error('Failed to delete comment:', error);
        }
      },
    }),

    // report a post
    reportPostAPI: builder.mutation({
      query: ({postId, payload}) => ({
        url: `${FEED_ENDPOINT}/${postId}/report`,
        method: 'POST',
        body: payload,
      }),
    }),

    // report a user
    reportUserAPI: builder.mutation({
      query: ({postId, payload}) => ({
        url: `${FEED_ENDPOINT}/${postId}/reportuser`,
        method: 'POST',
        body: payload,
      }),
    }),

    //socket user deletion
    // refreshDataOnUserDeleted: builder.query({
    //   queryFn: () => ({data: null}), // No direct API call, socket will handle this
    //   async onCacheEntryAdded(
    //     _,
    //     {cacheDataLoaded, cacheEntryRemoved, dispatch},
    //   ) {
    //     try {
    //       await cacheDataLoaded;

    //       // Socket Listener for `user_deleted` Event
    //       const handleUserDeleted = ({user_id, deleted}) => {

    //         // Refetch relevant queries
    //         dispatch(feedApiSlice.util.invalidateTags(['Post']));
    //         dispatch(feedApiSlice.util.invalidateTags(['Comment']));
    //         dispatch(feedApiSlice.util.invalidateTags(['Like']));
    //       };

    //       socket?.socket?.on('user_deleted', handleUserDeleted);

    //       // Clean up listener when cache is removed
    //       await cacheEntryRemoved;
    //       socket?.socket?.off('user_deleted', handleUserDeleted);
    //     } catch (error) {
    //       console.error('Socket error:', error);
    //     }
    //   },
    // }),
    refreshDataOnUserDeleted: builder.query({
      queryFn: () => ({data: null}),
      async onCacheEntryAdded(
        _,
        {cacheDataLoaded, cacheEntryRemoved, dispatch},
      ) {
        try {
          await cacheDataLoaded;

          const handleUserDeleted = ({user_id, deleted}) => {
            dispatch(feedApiSlice.util.invalidateTags(['Post']));
            dispatch(feedApiSlice.util.invalidateTags(['Comment']));
            dispatch(feedApiSlice.util.invalidateTags(['Like']));

            // Force refetch to ensure UI updates instantly
            dispatch(
              feedApiSlice.endpoints.getCommentsCount.initiate(null, {
                forceRefetch: true,
              }),
            );
          };

          socket?.socket?.on('user_deleted', handleUserDeleted);

          await cacheEntryRemoved;
          socket?.socket?.off('user_deleted', handleUserDeleted);
        } catch (error) {
          console.error('Socket error:', error);
        }
      },
    }),
  }),
});

// Export the hooks for each query/mutation
export const {
  useFeedListAPIQuery,
  usePostDetailsAPIQuery,
  useCreatePostAPIMutation,
  useCreateCommentAPIMutation,
  useLikePostAPIMutation,
  useUnLikePostAPIMutation,
  useNewCommentsByPostIdAPIQuery,
  useGetPostLikesQuery,
  useGetCommentsCountQuery,
  useDeleteCommentAPIMutation,
  useReportPostAPIMutation,
  useReportUserAPIMutation,
  useRefreshDataOnUserDeletedQuery,
} = feedApiSlice;
