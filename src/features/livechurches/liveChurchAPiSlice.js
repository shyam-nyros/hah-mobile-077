import {rootApiSlice} from '../../store/rootApiSlice';
const LIVE_CHURCHES_ENDPOINT = '/api/live-churches';

export const churchAPISlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    getLiveChurchesAPI: builder.query({
      // query: ({page}) => ({
      //   url: `${LIVE_CHURCHES_ENDPOINT}?page=${page}`,
      // }),
      query: ({search, page, location}) => {
        let url = `${LIVE_CHURCHES_ENDPOINT}?page=${page}&search=${
          search ? search : ''
        }`;
        // Conditionally append the location if location are provided
        if (location?.latitude && location?.longitude) {
          const locationParam = JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          url += `&location=${encodeURIComponent(locationParam)}`;
        }
        return {
          url,
        };
      },
      transformResponse: (response, meta, arg) => {
        const hasMore = response.livechurches.length === 20; //each page has 20 items
        return {
          hasMore,
          list: response.livechurches,
        };
      },
      serializeQueryArgs: ({endpointName}) => endpointName,

      // forceRefetch({currentArg, previousArg}) {
      //   if (previousArg === undefined) {
      //     return true;
      //   }
      //   return (
      //     currentArg?.page !== previousArg?.page ||
      //     JSON.stringify(currentArg?.location) !==
      //       JSON.stringify(previousArg?.location)
      //   );
      // },
      forceRefetch({currentArg, previousArg}) {
        if (!previousArg) {
          return true; // Always refetch if there's no previous argument
        }

        // Check if page number or coordinates have changed
        const pageChanged = currentArg?.page !== previousArg?.page;
        const coordsChanged =
          currentArg?.location?.latitude !== previousArg?.location?.latitude ||
          currentArg?.location?.longitude !== previousArg?.location?.longitude;

        return pageChanged || coordsChanged;
      },
      merge: (currentCache, newItems, {arg}) => {
        const {page, location} = arg;

        // const coordsChanged =
        // location?.latitude !== previousArg?.location?.latitude ||
        // location?.longitude !== previousArg?.location?.longitude;

        if (page === 1) {
          return newItems;
        }

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

    // getLiveChurchesAPI: builder.query({
    //   query: ({location}) => ({
    //     url: `${LIVE_CHURCHES_ENDPOINT}`,
    //     params: {
    //       location: JSON.stringify(location),
    //     },
    //   }),
    // }),

    liveChurchDetailsAPI: builder.query({
      query: ({liveChurchId}) => ({
        url: `${LIVE_CHURCHES_ENDPOINT}/${liveChurchId}`,
      }),
    }),

    liveChurchFeedAPI: builder.mutation({
      query: ({churchId, liveChurchId, message}) => ({
        url: `${LIVE_CHURCHES_ENDPOINT}/by-church/${churchId}/${liveChurchId}/feed`,
        method: 'POST',
        body: {message},
      }),
    }),

    liveChurchRsvpAPI: builder.mutation({
      query: ({id, rsvp}) => ({
        url: `${LIVE_CHURCHES_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      invalidatesTags: ['Live-Church'],
    }),
  }),
});

export const {
  useGetLiveChurchesAPIQuery,
  useLiveChurchDetailsAPIQuery,
  useLiveChurchFeedAPIMutation,
  useLiveChurchRsvpAPIMutation,
} = churchAPISlice;
