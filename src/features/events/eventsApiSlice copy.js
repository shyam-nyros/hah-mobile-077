import {rootApiSlice} from '../../store/rootApiSlice';
const EVENTS_ENDPOINT = '/api/events';

export const eventsApiSlice = rootApiSlice.injectEndpoints({
  endpoints: builder => ({
    featuredAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=featured`,
      }),
      providesTags: ['Events', 'User', 'Zipcode'],
      keepUnusedDataFor: 0,
    }),
    happeningTodayAPI: builder.query({
      query: data => ({
        url: `${EVENTS_ENDPOINT}/all?group_by=today`,
      }),
      keepUnusedDataFor: 0,
      providesTags: ['Events', 'User', 'Zipcode'],
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
      providesTags: ['Events', 'User'],
    }),
    rsvpAPI: builder.mutation({
      query: ({id, rsvp}) => ({
        url: `${EVENTS_ENDPOINT}/${id}/rsvp`,
        method: 'PUT',
        body: {rsvp},
      }),
      invalidatesTags: ['Events'],
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
      keepUnusedDataFor: 0,
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

// const state = dispatch(rootApiSlice.util.getState());


// const searchQueryCache = state.rootApiSlice.queries['eventsSearchAPI']?.data;

