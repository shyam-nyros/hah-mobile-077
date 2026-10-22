import {rootApiSlice} from '../../store/rootApiSlice';
const LIBRARY_ENDPOINT = '/api/libraries/home';
const AUTH_ENDPOINT = '/api/user';

export const libraryAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    learningAPI: builder.query({
      query: () => ({
        url: `${LIBRARY_ENDPOINT}/continue-learnings`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.libraries;
      },
    }),
    globalLeadersAPI: builder.query({
      query: () => ({
        url: `${LIBRARY_ENDPOINT}/leaders`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.leaders;
      },
    }),
    popularAPI: builder.query({
      query: () => ({
        url: `${LIBRARY_ENDPOINT}/popular`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.libraries;
      },
    }),
    trendingAPI: builder.query({
      query: () => ({
        url: `${LIBRARY_ENDPOINT}/trending`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.libraries;
      },
    }),
    // library item viewesd - to calculate the views count for a library item
    libraryItemViewedAPI: builder.mutation({
      query: (libraryId) => ({
        url: `${LIBRARY_ENDPOINT}/trending/${libraryId}`,
        method: 'POST',
      }),
      transformResponse: (response, meta, arg) => {
        return response;
      },
    }),
    libraryCategoriesAPI: builder.query({
      query: () => ({
        url: `${LIBRARY_ENDPOINT}/by_categories`,
      }),
    }),
    librarySearchAPI: builder.query({
      query: ({filter, subfilter, page, search}) => ({
        url: `/api/libraries?search=${
          search ? search : ''
        }&filter=${filter}&subfilter=${subfilter}&page=${page}`,
      }),
      serializeQueryArgs: ({endpointName}) => endpointName,

      forceRefetch: ({currentArg, previousArg}) =>
        currentArg?.search !== previousArg?.search ||
        currentArg?.filter !== previousArg?.filter,
      transformResponse: (response, meta, arg) => {
        const hasMore = response.libraries.length === 5; //each page has 20 items
        return {
          hasMore,
          list: response.libraries,
        };
      },
      // merge: (existing, incoming, {arg: {page}}) => {
      merge: (currentCache, newItems, {arg: {filter, page, search}}) => {
        if (page === 1) return newItems;
        const mergedData = {
          list: [...currentCache.list, ...newItems.list].filter(
            (item, index, self) =>
              index === self.findIndex(i => i._id === item._id), // Keep only the first occurrence of each unique item by '_id'
          ),
          hasMore: newItems?.hasMore, // Update `hasMore` based on the latest response
        };

        return mergedData;
      },
      keepUnusedDataFor: 0,
    }),

    libraryDetailsAPI: builder.query({
      query: libraryItemId => ({
        url: `/api/libraries/${libraryItemId}`,
      }),
      // forceRefetch: ({currentArg, previousArg}) => currentArg !== previousArg,
      forceRefetch: ({ currentArg, previousArg }) => {
     
        return currentArg !== previousArg;
    },
    
      // serializeQueryArgs: ({endpointName}) => endpointName,
      serializeQueryArgs: ({endpointName, queryArgs}) => {
        return `${endpointName}-${queryArgs}`;
      },
      keepUnusedDataFor: 0,
    }),

    // to download the YT link attachment
    downloadYTLinkAPI: builder.query({
      query: libraryItemId => ({
        url: `/api/libraries/${libraryItemId}/download`,
        responseHandler: async response => {
          const blob = await response.blob();
          return blob;
        },
      }),
      keepUnusedDataFor: 0,
    }),

    saveBookMarksAPI: builder.mutation({
      query: libraryItemId => {
        
        return {
          url: `${AUTH_ENDPOINT}/libraries/bookmarks/${libraryItemId}`,
          method: 'POST',
        };
      },
      async onQueryStarted(libraryItemId, {dispatch, queryFulfilled}) {
        const patchBookmark = dispatch(
          rootApiSlice.util.updateQueryData(
            'libraryDetailsAPI',
            libraryItemId, // Use the correct cache key
            draft => {
              if (draft) {
                draft.library.user_bookmarked = true; // Assuming your draft has an `isBookmarked` field
              }
            },
          ),
        );


        const patchSearchedBookmark = dispatch(
          rootApiSlice.util.updateQueryData(
            'librarySearchAPI',
            undefined, // Use the correct cache key
            draft => {
              if (draft && draft.list) {
            
                const itemToUpdate = draft.list.find(
                  item => item._id === libraryItemId,
                );
          
                if (itemToUpdate) {
                  itemToUpdate.user_bookmarked = true; // Update the specific item's bookmarked status
                }
              }
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          console.error('ERROR OCCURRED:', error);
          patchBookmark.undo(); // Rollback optimistic update on failure
          patchSearchedBookmark.undo(); // Rollback optimistic update on failure
        }
      },
    }),

    removeBookMarksAPI: builder.mutation({
      query: libraryItemId => ({
        url: `${AUTH_ENDPOINT}/libraries/bookmarks/${libraryItemId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(libraryItemId, {dispatch, queryFulfilled}) {
        const patchBookmark = dispatch(
          rootApiSlice.util.updateQueryData(
            'libraryDetailsAPI',
            libraryItemId, // Use the correct cache key
            draft => {
              if (draft) {
                draft.library.user_bookmarked = false;
              }
            },
          ),
        );

    
        const patchSearchedBookmark = dispatch(
          rootApiSlice.util.updateQueryData(
            'librarySearchAPI',
            undefined, // Use the correct cache key
            draft => {
              if (draft && draft.list) {
              
                const itemToUpdate = draft.list.find(
                  item => item._id === libraryItemId,
                );
           
                if (itemToUpdate) {
                  itemToUpdate.user_bookmarked = false; // Update the specific item's bookmarked status
                }
              }
            },
          ),
        );

        try {
          await queryFulfilled; // Wait for the mutation to complete
        } catch (error) {
          console.error('ERROR OCCURRED:', error);
          patchBookmark.undo(); // Rollback optimistic update on failure
          patchSearchedBookmark.undo(); // Rollback optimistic update on failure
        }
      },
    }),
  }),
});

// Export the hooks
export const {
  useLearningAPIQuery,
  useGlobalLeadersAPIQuery,
  usePopularAPIQuery,
  useTrendingAPIQuery,
  useLibraryItemViewedAPIMutation,
  useLibraryCategoriesAPIQuery,
  useLibrarySearchAPIQuery,
  useLibraryDetailsAPIQuery,
  useDownloadYTLinkAPIQuery,
  useSaveBookMarksAPIMutation,
  useRemoveBookMarksAPIMutation,
} = libraryAPISlice;
