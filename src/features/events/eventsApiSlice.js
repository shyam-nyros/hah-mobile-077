import {rootApiSlice} from '../../store/rootApiSlice';
const EVENTS_ENDPOINT = '/api/events';

export const eventsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    featuredAPI: builder.query({
      // query: data => ({
      //   url: `${EVENTS_ENDPOINT}/all?group_by=featured`,
      // }),
      query: ({location}) => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=featured${
          location
            ? `&location=${encodeURIComponent(JSON.stringify(location))}`
            : ''
        }`,
      }),
      providesTags: (result, error, arg) =>
        result?.events?.length
          ? [
              ...result.events.map(event => ({
                type: 'Events',
                id: event._id,
              })),
              'Events',
              'User',
              'Zipcode',
            ]
          : ['Events', 'User', 'Zipcode'],
      // keepUnusedDataFor: 0,
    }),
    happeningTodayAPI: builder.query({
      // query: data => ({
      //   url: `${EVENTS_ENDPOINT}/all?group_by=today`,
      // }),
      query: ({location}) => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=today${
          location
            ? `&location=${encodeURIComponent(JSON.stringify(location))}`
            : ''
        }`,
      }),
      // keepUnusedDataFor: 0,
      // providesTags: ['Events', 'User', 'Zipcode'],
      providesTags: (result, error, arg) =>
        result?.events?.length
          ? [
              ...result.events.map(event => ({
                type: 'Events',
                id: event._id,
              })),
              'Events',
              'User',
              'Zipcode',
            ]
          : ['Events', 'User', 'Zipcode'],
    }),
    eventsThisWeekAPI: builder.query({
      // query: data => ({
      //   url: `${EVENTS_ENDPOINT}/all?group_by=week`,
      // }),
      query: ({location}) => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=week${
          location
            ? `&location=${encodeURIComponent(JSON.stringify(location))}`
            : ''
        }`,
      }),
      keepUnusedDataFor: 0,
      providesTags: (result, error, arg) =>
        result?.events?.length
          ? [
              ...result.events.map(event => ({
                type: 'Events',
                id: event._id,
              })),
              'Events',
              'User',
              'Zipcode',
            ]
          : ['Events', 'User', 'Zipcode'],
    }),
    upcomingEventsAPI: builder.query({
      // query: data => ({
      //   url: `${EVENTS_ENDPOINT}/all?group_by=upcoming`,
      // }),
      query: ({location}) => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=upcoming${
          location
            ? `&location=${encodeURIComponent(JSON.stringify(location))}`
            : ''
        }`,
      }),
      keepUnusedDataFor: 0,
      providesTags: (result, error, arg) =>
        result?.events?.length
          ? [
              ...result.events.map(event => ({
                type: 'Events',
                id: event._id,
              })),
              'Events',
              'User',
              'Zipcode',
            ]
          : ['Events', 'User', 'Zipcode'],
    }),
    eventDetailsAPI: builder.query({
      query: eventId => ({
        url: `${EVENTS_ENDPOINT}/${eventId}`,
      }),
      keepUnusedDataFor: 0,
      providesTags: (result, error, arg) => [{type: 'Events', id: arg}, 'User'],
    }),

    eventsSearchAPI: builder.query({
      query: ({groupBy, page, search, location}) => {
        let url = `${EVENTS_ENDPOINT}/all?search=${
          search ? search : ''
        }&group_by=${groupBy}&page=${page}`;

        // Append location only if both latitude and longitude are present
        if (location?.latitude && location?.longitude) {
          const locationParam = JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
          });
          url += `&location=${encodeURIComponent(locationParam)}`;
        }

        return {url};
      },

      serializeQueryArgs: ({endpointName}) => endpointName,

      forceRefetch: ({currentArg, previousArg}) =>
        currentArg?.groupBy !== previousArg?.groupBy ||
        currentArg?.page !== previousArg?.page ||
        currentArg?.search !== previousArg?.search ||
        currentArg?.location?.latitude !== previousArg?.location?.latitude ||
        currentArg?.location?.longitude !== previousArg?.location?.longitude,

      transformResponse: (response, meta, arg) => {
        const hasMore = response.events.length === 5;
        return {
          hasMore,
          list: response.events,
        };
      },

      merge: (currentCache, newItems, {arg: {page}}) => {
        if (page === 1) return newItems;

        return {
          list: [...currentCache.list, ...newItems.list].filter(
            (item, index, self) =>
              index === self.findIndex(i => i._id === item._id),
          ),
          hasMore: newItems?.hasMore,
        };
      },
      providesTags: result =>
        result?.list?.length
          ? [
              ...result.list.map(event => ({
                type: 'Events',
                id: event._id,
              })),
              'Events',
            ]
          : ['Events'],
    }),

    rsvpAPI: builder.mutation({
      query: ({id, rsvp, groupBy, page, search}) => ({
        url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      invalidatesTags: (result, error, arg) => [
        {type: 'Events', id: arg.id},
        'Events',
      ],
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        // const searchParams = {
        //   groupBy: 'featured',
        //   page: 1,
        //   search: '',
        // };
        const searchParams = {
          groupBy: args.groupBy,
          page: args.page,
          search: args.search,
        };
        // Apply optimistic update and store the undo function
        const searchResultsPatch = dispatch(
          rootApiSlice.util.updateQueryData(
            'eventsSearchAPI',
            searchParams,
            draft => {
              if (!draft) return;
              const eventIndex = draft.list.findIndex(
                event => event._id === args.id,
              );

              if (eventIndex !== -1) {
                const currentStatus =
                  draft.list[eventIndex].currentUserResponse;
                // Optimistically update the status
                draft.list[eventIndex].currentUserResponse =
                  currentStatus === 'Attending' ? 'Not Attending' : 'Attending';
              }
            },
          ),
        );

        // Apply optimistic update and store the undo function
        const featuredPatch = dispatch(
          rootApiSlice.util.updateQueryData('featuredAPI', {}, draft => {
            if (!draft?.events) return;
            const eventIndex = draft.events.findIndex(
              event => event._id === args.id,
            );

            if (eventIndex !== -1) {
              const currentStatus =
                draft.events[eventIndex].currentUserResponse;

              // Optimistically update the status
              draft.events[eventIndex].currentUserResponse =
                currentStatus === 'Attending' ? 'Not Attending' : 'Attending';
            }
          }),
        );

        // Apply optimistic update and store the undo function
        const happeningTodayPatch = dispatch(
          rootApiSlice.util.updateQueryData('happeningTodayAPI', {}, draft => {
            if (!draft?.events) return;
            const eventIndex = draft.events.findIndex(
              event => event._id === args.id,
            );

            if (eventIndex !== -1) {
              const currentStatus =
                draft.events[eventIndex].currentUserResponse;

              // Optimistically update the status
              draft.events[eventIndex].currentUserResponse =
                currentStatus === 'Attending' ? 'Not Attending' : 'Attending';
            }
          }),
        );

        // Apply optimistic update and store the undo function
        const eventsThisWeekPatch = dispatch(
          rootApiSlice.util.updateQueryData('eventsThisWeekAPI', {}, draft => {
            if (!draft?.events) return;
            const eventIndex = draft.events.findIndex(
              event => event._id === args.id,
            );

            if (eventIndex !== -1) {
              const currentStatus =
                draft.events[eventIndex].currentUserResponse;

              // Optimistically update the status
              draft.events[eventIndex].currentUserResponse =
                currentStatus === 'Attending' ? 'Not Attending' : 'Attending';
            }
          }),
        );

        // Apply optimistic update and store the undo function
        const upcomingEventsPatch = dispatch(
          rootApiSlice.util.updateQueryData('upcomingEventsAPI', {}, draft => {
            if (!draft?.events) return;
            const eventIndex = draft.events.findIndex(
              event => event._id === args.id,
            );

            if (eventIndex !== -1) {
              const currentStatus =
                draft.events[eventIndex].currentUserResponse;

              // Optimistically update the status
              draft.events[eventIndex].currentUserResponse =
                currentStatus === 'Attending' ? 'Not Attending' : 'Attending';
            }
          }),
        );

        try {
          // Wait for API response
          await queryFulfilled;
        } catch (error) {
          searchResultsPatch.undo();
          featuredPatch.undo();
          happeningTodayPatch.undo(); // Rollback on failure
          eventsThisWeekPatch.undo();
          upcomingEventsPatch.undo();
          console.error(error);
        }
      },
    }),
  }),
});

export const {
  useFeaturedAPIQuery,
  useHappeningTodayAPIQuery,
  useEventsThisWeekAPIQuery,
  useUpcomingEventsAPIQuery,
  useEventDetailsAPIQuery,
  useRsvpAPIMutation,
  useEventsSearchAPIQuery,
} = eventsApiSlice;
