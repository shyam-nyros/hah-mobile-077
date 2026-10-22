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
    // rsvpAPI: builder.mutation({
    //   query: ({id, rsvp}) => ({
    //     url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
    //     method: 'PUT',
    //     body: {rsvp},
    //   }),
    //   invalidatesTags: ['Events'],
    // }),
    rsvpAPI1: builder.mutation({
      query: ({id, rsvp}) => ({
        url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      // invalidatesTags: ['Events'],

      // async onQueryStarted(args, {dispatch, queryFulfilled}) {
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        try {


          const patchFeedList = dispatch(
            rootApiSlice.util.updateQueryData(
              'happeningTodayAPI',
              undefined,
              draft => {
            
              },
            ),
          );

          // dispatch(
          //   rootApiSlice.util.updateQueryData(
          //     'happeningTodayAPI',
          //     undefined,
          //     draft => {
   

  
          //       draft?.forEach(event => {
          //         if (event.id === id) {
          //           event.rsvp = rsvp;
          //         }
          //       });
          //     },
          //   ),
          // );

          // ✅ Update eventDetailsAPI cache
          // dispatch(
          //   rootApiSlice.util.updateQueryData(
          //     'eventDetailsAPI',
          //     id,
          //     draft => {
          //       if (draft) {
 

          //         draft.rsvp = rsvp;
          //       }
          //     },
          //   ),
          // );

          // ✅ Update featuredAPI cache (list page)
          // dispatch(
          //   rootApiSlice.util.updateQueryData(
          //     'featuredAPI',
          //     undefined,
          //     draft => {
 

    
          //       draft?.forEach(event => {
          //         if (event.id === id) {
          //           event.rsvp = rsvp;
          //         }
          //       });
          //     },
          //   ),
          // );

          // // ✅ Update eventsSearchAPI cache (search page)
          // dispatch(
          //   rootApiSlice.util.updateQueryData(
          //     'eventsSearchAPI',
          //     undefined,
          //     draft => {
  
          //       draft?.forEach(event => {
          //         if (event.id === id) {
          //           event.rsvp = rsvp;
          //         }
          //       });
          //     },
          //   ),
          // );

          // Wait for the API to confirm the change
          await queryFulfilled;
        } catch (error) {
      

          // Optional: Handle optimistic update rollback if the mutation fails
        }
      },
    }),

    rsvpAPI: builder.mutation({
      query: ({id, rsvp}) => ({
        url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      async onQueryStarted(args, {queryFulfilled, dispatch}) {
        // Optimistic update: immediately update the UI for both list and details
      

        const patchedResults = dispatch(
          rootApiSlice.util.updateQueryData(
            'happeningTodayAPI',
            undefined,
            draft => {
         
            },
          ),
        );


        

        try {
          // Wait for the server response
        } catch (error) {
          // Rollback on failure: undo both optimistic updates
  
        }
      },
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
      // keepUnusedDataFor: 0,
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
