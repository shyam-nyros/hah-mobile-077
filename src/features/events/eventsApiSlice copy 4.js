import {rootApiSlice} from '../../store/rootApiSlice';
const EVENTS_ENDPOINT = '/api/events';

export const eventsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    featuredAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=featured`,
      }),
      // providesTags: ['Events', 'User', 'Zipcode'],
      providesTags: ['User', 'Zipcode'],
      // keepUnusedDataFor: 0,
    }),
    happeningTodayAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=today`,
      }),
      // keepUnusedDataFor: 0,
      // providesTags: ['Events', 'User', 'Zipcode'],
      providesTags: ['User', 'Zipcode'],
    }),
    eventsThisWeekAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=week`,
      }),
      keepUnusedDataFor: 0,
      providesTags: ['Events', 'User', 'Zipcode'],
    }),
    upcomingEventsAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=upcoming`,
      }),
      keepUnusedDataFor: 0,
      providesTags: ['Events', 'User', 'Zipcode'],
    }),
    eventDetailsAPI: builder.query({
      query: eventId => ({
        url: `${EVENTS_ENDPOINT}/${eventId}`,
      }),
      keepUnusedDataFor: 0,
      providesTags: ['User'],
    }),

    eventsSearchAPI: builder.query({
      query: ({groupBy, page, search}) => ({
        url: `${EVENTS_ENDPOINT}/all?search=${
          search ? search : ''
        }&group_by=${groupBy}&page=${page}`,
      }),
      transformResponse: (response, meta, arg) => {
        return response.events;
      },
    }),

    rsvpAPI: builder.mutation({
      query: ({id, rsvp, groupBy, page, search}) => ({
        url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      async onQueryStarted(args, {queryFulfilled, dispatch}) {



        const searchParams = {
          groupBy: 'featured',
          page: 1,
          search: '',
        };
        // const searchParams = {
        //   groupBy: args.groupBy,
        //   page: args.page,
        //   search: args.search,
        // };
        // Apply optimistic update and store the undo function
        const searchResultsPatch = dispatch(
          rootApiSlice.util.updateQueryData(
            'eventsSearchAPI',
            searchParams,
            draft => {
         
              // if (!draft) return;
              const eventIndex = draft.findIndex(
                event => event._id === args.id,
              );

       
              

              if (eventIndex !== -1) {
         
                
                const currentStatus = draft[eventIndex].currentUserResponse;
                
                // Optimistically update the status
                draft[eventIndex].currentUserResponse =
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

        try {
          // Wait for API response
          await queryFulfilled;
       

        } catch (error) {
   
          featuredPatch.undo();
          happeningTodayPatch.undo(); // Rollback on failure
          searchResultsPatch.undo();
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
